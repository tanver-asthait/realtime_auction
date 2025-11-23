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
  constructor(
    @InjectModel(AuctionState.name)
    private auctionStateModel: Model<AuctionStateDocument>,
    private playersService: PlayersService,
    private teamsService: TeamsService,
  ) {}

  async startAuction(playerId: string): Promise<AuctionStateDocument> {
    const player = await this.playersService.findOne(playerId);

    if (player.status !== PlayerStatus.PENDING) {
      throw new BadRequestException('Player is not available for auction');
    }

    // Update player status
    await this.playersService.update(playerId, {
      status: PlayerStatus.AUCTIONING,
    });

    // Get or create auction state
    let auctionState = await this.auctionStateModel.findOne().exec();
    if (!auctionState) {
      auctionState = new this.auctionStateModel({});
    }

    auctionState.currentPlayerId = playerId;
    auctionState.highestBid = player.basePrice;
    auctionState.highestBidTeamId = null;
    auctionState.timer = 30; // 30 seconds
    auctionState.isRunning = true;

    return auctionState.save();
  }

  async placeBid(
    teamId: string,
    playerId: string,
    bidAmount: number,
  ): Promise<AuctionStateDocument> {
    const auctionState = await this.getAuctionStatus();

    if (!auctionState.isRunning) {
      throw new BadRequestException('No active auction');
    }

    if (auctionState.currentPlayerId !== playerId) {
      throw new BadRequestException(
        'This player is not currently being auctioned',
      );
    }

    if (bidAmount <= auctionState.highestBid) {
      throw new BadRequestException(
        `Bid must be higher than current highest bid of ${auctionState.highestBid}`,
      );
    }

    const team = await this.teamsService.findOne(teamId);
    if (team.budget < bidAmount) {
      throw new BadRequestException('Insufficient budget for this bid');
    }

    auctionState.highestBid = bidAmount;
    auctionState.highestBidTeamId = teamId;
    auctionState.timer = 30; // Reset timer

    return auctionState.save();
  }

  async endAuction(playerId: string): Promise<any> {
    const auctionState = await this.getAuctionStatus();

    if (!auctionState.isRunning) {
      throw new BadRequestException('No active auction');
    }

    if (auctionState.currentPlayerId !== playerId) {
      throw new BadRequestException(
        'This player is not currently being auctioned',
      );
    }

    auctionState.isRunning = false;

    let result: any = {
      playerId,
      sold: false,
    };

    // If there was a winning bid
    if (auctionState.highestBidTeamId) {
      // Assign player to team
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
        sold: true,
        teamId: auctionState.highestBidTeamId,
        finalPrice: auctionState.highestBid,
      };
    } else {
      // No bids, mark player as pending again
      await this.playersService.update(playerId, {
        status: PlayerStatus.PENDING,
      });
    }

    // Reset auction state
    auctionState.currentPlayerId = null;
    auctionState.highestBid = 0;
    auctionState.highestBidTeamId = null;
    auctionState.timer = 0;
    await auctionState.save();

    return result;
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
}
