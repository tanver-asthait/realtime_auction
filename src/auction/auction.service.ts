import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuctionState, AuctionStateDocument } from './auction-state.schema';
import { PlayersService } from '../players/players.service';
import { TeamsService } from '../teams/teams.service';
import { PlayerStatus } from '../players/players.schema';

@Injectable()
export class AuctionService {
  private timerInterval: NodeJS.Timeout | null = null;
  private gateway: any = null; // Will be set by gateway

  constructor(
    @InjectModel(AuctionState.name)
    private auctionStateModel: Model<AuctionStateDocument>,
    private playersService: PlayersService,
    private teamsService: TeamsService,
  ) {}

  /**
   * Set gateway reference for broadcasting
   */
  setGateway(gateway: any) {
    this.gateway = gateway;
  }

  /**
   * Start auction for a specific player
   * Rules:
   * - Player must be in PENDING status
   * - Set initial bid to basePrice (1)
   * - Start 20 second timer
   */
  async startAuction(playerId: string): Promise<AuctionStateDocument> {
    // Check if auction is already running
    const currentState = await this.getAuctionStatus();
    if (currentState.isRunning) {
      throw new BadRequestException('An auction is already running');
    }

    const player = await this.playersService.findOne(playerId);

    if (player.status !== PlayerStatus.PENDING) {
      throw new BadRequestException(
        'Player is not available for auction (must be PENDING)',
      );
    }

    // Update player status to AUCTIONING
    await this.playersService.update(playerId, {
      status: PlayerStatus.AUCTIONING,
    });

    // Get or create auction state
    let auctionState = await this.auctionStateModel.findOne().exec();
    if (!auctionState) {
      auctionState = new this.auctionStateModel({});
    }

    auctionState.currentPlayerId = playerId;
    auctionState.highestBid = player.basePrice || 1; // Default to 1
    auctionState.highestBidTeamId = null;
    auctionState.timer = 20; // 20 seconds as per rules
    auctionState.isRunning = true;

    const savedState = await auctionState.save();

    // Start timer countdown
    this.startTimer();

    // Broadcast auction started
    if (this.gateway) {
      const formattedState = await this.getFormattedAuctionState();
      this.gateway.broadcastAuctionStarted({
        player: formattedState.currentPlayer,
        basePrice: player.basePrice || 1,
        timer: 20,
      });
      this.gateway.broadcastStateUpdate(formattedState);
    }

    return savedState;
  }

  /**
   * Move to next player (admin function)
   * This will end current auction and start new one
   */
  async nextPlayer(playerId: string): Promise<AuctionStateDocument> {
    const currentState = await this.getAuctionStatus();

    // If auction is running, end it first
    if (currentState.isRunning && currentState.currentPlayerId) {
      await this.sellPlayer(currentState.currentPlayerId);
    }

    // Start auction for next player
    return this.startAuction(playerId);
  }

  /**
   * Validate if a bid can be placed
   * Rules:
   * - Auction must be running
   * - Player must be in AUCTIONING status
   * - Team budget >= new bid amount
   * - New bid must be exactly +1 from current highest
   */
  async validateBid(
    teamId: string,
    bidAmount: number,
  ): Promise<{ valid: boolean; error?: string }> {
    try {
      const auctionState = await this.getAuctionStatus();

      // Check if auction is running
      if (!auctionState.isRunning) {
        return { valid: false, error: 'No active auction' };
      }

      // Check if player is being auctioned
      if (!auctionState.currentPlayerId) {
        return { valid: false, error: 'No player in auction' };
      }

      const player = await this.playersService.findOne(
        auctionState.currentPlayerId,
      );
      if (player.status !== PlayerStatus.AUCTIONING) {
        return { valid: false, error: 'Player is not in AUCTIONING status' };
      }

      // Check bid increment rule: must be exactly +1
      const expectedBid = auctionState.highestBid + 1;
      if (bidAmount !== expectedBid) {
        return {
          valid: false,
          error: `Bid must be exactly ${expectedBid} (current: ${auctionState.highestBid} + 1)`,
        };
      }

      // Check team budget
      const team = await this.teamsService.findOne(teamId);
      if (team.budget < bidAmount) {
        return {
          valid: false,
          error: `Insufficient budget. Team has ${team.budget}, needs ${bidAmount}`,
        };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * Place a bid
   * Rules:
   * - Must pass validation
   * - Increment is always +1
   * - Timer resets to 20 seconds
   */
  async placeBid(
    teamId: string,
    playerId: string,
    bidAmount: number,
  ): Promise<AuctionStateDocument> {
    const auctionState = await this.getAuctionStatus();

    // Validate bid
    const validation = await this.validateBid(teamId, bidAmount);
    if (!validation.valid) {
      throw new BadRequestException(validation.error);
    }

    // Check if correct player
    if (auctionState.currentPlayerId !== playerId) {
      throw new BadRequestException('This player is not currently in auction');
    }

    // Update auction state
    auctionState.highestBid = bidAmount;
    auctionState.highestBidTeamId = teamId;
    auctionState.timer = 20; // Reset timer to 20 seconds

    const savedState = await auctionState.save();

    // Restart timer
    this.startTimer();

    // Broadcast bid placed
    if (this.gateway) {
      const team = await this.teamsService.findOne(teamId);
      this.gateway.broadcastBidPlaced({
        teamId,
        teamName: team.name,
        bidAmount,
        playerId,
        timestamp: new Date().toISOString(),
      });
      const formattedState = await this.getFormattedAuctionState();
      this.gateway.broadcastStateUpdate(formattedState);
    }

    return savedState;
  }

  /**
   * Start timer countdown
   * Timer counts down from current value to 0
   * When it hits 0, automatically sell player
   */
  private startTimer() {
    // Clear any existing timer
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.timerInterval = setInterval(async () => {
      try {
        const auctionState = await this.getAuctionStatus();

        if (!auctionState.isRunning) {
          this.stopTimer();
          return;
        }

        auctionState.timer -= 1;

        if (auctionState.timer <= 0) {
          auctionState.timer = 0;
          await auctionState.save();

          // Timer hit 0, sell player
          if (auctionState.currentPlayerId) {
            await this.sellPlayer(auctionState.currentPlayerId);
          }

          this.stopTimer();
        } else {
          await auctionState.save();

          // Broadcast timer update
          if (this.gateway) {
            this.gateway.broadcastTimerUpdate({
              timer: auctionState.timer,
              isRunning: auctionState.isRunning,
            });
          }
        }
      } catch (error) {
        console.error('Timer error:', error);
        this.stopTimer();
      }
    }, 1000); // Every 1 second
  }

  /**
   * Stop timer
   */
  private stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  /**
   * Sell player to highest bidder
   * Rules:
   * - Assign player to highestBidTeam
   * - Deduct budget from team
   * - Mark player as SOLD
   * - Reset auction state
   * - Stop timer
   */
  async sellPlayer(playerId: string): Promise<any> {
    const auctionState = await this.getAuctionStatus();

    if (!auctionState.isRunning) {
      throw new BadRequestException('No active auction');
    }

    if (auctionState.currentPlayerId !== playerId) {
      throw new BadRequestException('This player is not currently in auction');
    }

    // Stop timer
    this.stopTimer();

    auctionState.isRunning = false;

    let result: any = {
      playerId,
      sold: false,
      reason: 'no_bids',
    };

    // If there was a winning bid
    if (auctionState.highestBidTeamId) {
      // Get player and team info before updating
      const player = await this.playersService.findOne(playerId);
      const team = await this.teamsService.findOne(
        auctionState.highestBidTeamId,
      );

      // Assign player to team (updates player status to SOLD)
      await this.playersService.assignToTeam(
        playerId,
        auctionState.highestBidTeamId,
        auctionState.highestBid,
      );

      // Add player to team and deduct budget
      await this.teamsService.addPlayerToTeam(
        auctionState.highestBidTeamId,
        playerId,
        auctionState.highestBid,
      );

      result = {
        playerId,
        playerName: player.name,
        sold: true,
        teamId: auctionState.highestBidTeamId,
        teamName: team.name,
        finalPrice: auctionState.highestBid,
        timestamp: new Date().toISOString(),
      };

      // Broadcast player sold
      if (this.gateway) {
        this.gateway.broadcastPlayerSold(result);
      }
    } else {
      // No bids, mark player as pending again
      await this.playersService.update(playerId, {
        status: PlayerStatus.PENDING,
      });

      result.reason = 'no_bids';
    }

    // Reset auction state
    auctionState.currentPlayerId = null;
    auctionState.highestBid = 0;
    auctionState.highestBidTeamId = null;
    auctionState.timer = 0;
    await auctionState.save();

    // Broadcast auction ended
    if (this.gateway) {
      this.gateway.broadcastAuctionEnded(result);
      const formattedState = await this.getFormattedAuctionState();
      this.gateway.broadcastStateUpdate(formattedState);
    }

    return result;
  }

  async endAuction(playerId: string): Promise<any> {
    return this.sellPlayer(playerId);
  }

  async getAuctionStatus(): Promise<AuctionStateDocument> {
    let auctionState = await this.auctionStateModel.findOne().exec();
    if (!auctionState) {
      auctionState = await this.auctionStateModel.create({
        currentPlayerId: null,
        highestBid: 0,
        highestBidTeamId: null,
        timer: 0,
        isRunning: false,
      });
    }
    return auctionState;
  }

  async resetAuction(): Promise<void> {
    // Stop timer
    this.stopTimer();

    await this.auctionStateModel.deleteMany({}).exec();

    // Reset all players to pending
    const players = await this.playersService.findAll();
    for (const player of players) {
      await this.playersService.resetPlayerStatus(player['_id']);
    }
  }

  async updateTimer(seconds: number): Promise<AuctionStateDocument> {
    const auctionState = await this.getAuctionStatus();
    auctionState.timer = seconds;
    return auctionState.save();
  }

  // ==================== GATEWAY HELPER METHODS ====================

  /**
   * Get formatted auction state for broadcasting
   */
  async getFormattedAuctionState(): Promise<any> {
    const auctionState = await this.getAuctionStatus();
    let currentPlayer = null;
    let highestBidTeam = null;

    if (auctionState.currentPlayerId) {
      currentPlayer = await this.playersService.findOne(
        auctionState.currentPlayerId,
      );
    }

    if (auctionState.highestBidTeamId) {
      highestBidTeam = await this.teamsService.findOne(
        auctionState.highestBidTeamId,
      );
    }

    return {
      currentPlayer,
      highestBid: auctionState.highestBid,
      highestBidTeam,
      timer: auctionState.timer,
      isRunning: auctionState.isRunning,
    };
  }

  /**
   * Check if auction is currently running
   */
  async isAuctionRunning(): Promise<boolean> {
    const auctionState = await this.getAuctionStatus();
    return auctionState.isRunning;
  }

  /**
   * Get current player in auction
   */
  async getCurrentPlayer(): Promise<any> {
    const auctionState = await this.getAuctionStatus();
    if (auctionState.currentPlayerId) {
      return this.playersService.findOne(auctionState.currentPlayerId);
    }
    return null;
  }
}
