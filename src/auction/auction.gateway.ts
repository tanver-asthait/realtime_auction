import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { AuctionService } from './auction.service';
import { PlayersService } from '../players/players.service';

interface BidPayload {
  playerId: string;
  teamId: string;
  bidAmount: number;
}

interface StartAuctionPayload {
  playerId: string;
}

interface NextPlayerPayload {
  playerId?: string;
}

interface SellPlayerPayload {
  playerId?: string;
}

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:4200', // Angular dev server
      'http://localhost:3000', // Alternative frontend
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST'],
  },
})
export class AuctionGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('AuctionGateway');

  constructor(
    private readonly auctionService: AuctionService,
    private readonly playersService: PlayersService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway Initialized');
    // Set gateway reference in service for broadcasting
    this.auctionService.setGateway(this);
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    // Send current auction state to newly connected client
    this.sendCurrentStateToClient(client);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // ==================== CLIENT EVENTS ====================

  /**
   * Handle bid event from teams
   * Payload: { playerId, teamId, bidAmount }
   */
  @SubscribeMessage('bid')
  async handleBid(
    @MessageBody() payload: BidPayload,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(
      `Bid received from client ${client.id}: ${JSON.stringify(payload)}`,
    );

    try {
      // Validate payload
      if (!payload.playerId || !payload.teamId || !payload.bidAmount) {
        throw new Error(
          'Missing required fields: playerId, teamId, or bidAmount',
        );
      }

      // Place bid through service using playerId from payload
      await this.auctionService.placeBid(
        payload.teamId,
        payload.playerId,
        payload.bidAmount,
      );

      return {
        event: 'bidAcknowledged',
        data: {
          success: true,
          playerId: payload.playerId,
          teamId: payload.teamId,
          bidAmount: payload.bidAmount,
        },
      };
    } catch (error) {
      this.logger.error(`Error handling bid: ${error.message}`);
      return {
        event: 'bidError',
        data: {
          success: false,
          error: error.message,
        },
      };
    }
  }

  // ==================== ADMIN EVENTS ====================

  /**
   * Admin event: Start auction for a specific player
   * Payload: { playerId }
   */
  @SubscribeMessage('startAuction')
  async handleStartAuction(
    @MessageBody() payload: StartAuctionPayload,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Start auction request: ${JSON.stringify(payload)}`);

    try {
      await this.auctionService.startAuction(payload.playerId);

      return {
        event: 'auctionStarted',
        data: {
          success: true,
          playerId: payload.playerId,
        },
      };
    } catch (error) {
      this.logger.error(`Error starting auction: ${error.message}`);
      this.broadcastError({
        message: error.message,
        code: 'START_AUCTION_ERROR',
      });
      return {
        event: 'auctionStartError',
        data: {
          success: false,
          error: error.message,
        },
      };
    }
  }

  /**
   * Admin event: Move to next player
   * Payload: { playerId? } - optional, will auto-select next unsold player if not provided
   */
  @SubscribeMessage('nextPlayer')
  async handleNextPlayer(
    @MessageBody() payload: NextPlayerPayload,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Next player request: ${JSON.stringify(payload)}`);

    try {
      let playerId = payload?.playerId;

      // If no playerId provided, get the next unsold player
      if (!playerId) {
        const nextUnsoldPlayer = await this.playersService.findNextUnsold();

        if (!nextUnsoldPlayer) {
          throw new Error('No more unsold players available');
        }

        playerId = nextUnsoldPlayer._id.toString();
        this.logger.log(
          `Auto-selected next unsold player: ${nextUnsoldPlayer.name} (${playerId})`,
        );
      }

      await this.auctionService.nextPlayer(playerId);

      return {
        event: 'nextPlayerSet',
        data: {
          success: true,
          playerId: playerId,
        },
      };
    } catch (error) {
      this.logger.error(`Error setting next player: ${error.message}`);
      this.broadcastError({
        message: error.message,
        code: 'NEXT_PLAYER_ERROR',
      });
      return {
        event: 'nextPlayerError',
        data: {
          success: false,
          error: error.message,
        },
      };
    }
  }

  /**
   * Admin event: Sell player (end auction and assign to highest bidder)
   * Payload: { playerId? } - playerId is optional, will use current player if not provided
   */
  @SubscribeMessage('sellPlayer')
  async handleSellPlayer(
    @MessageBody() payload: SellPlayerPayload,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Sell player request: ${JSON.stringify(payload)}`);

    try {
      // If no playerId provided, get it from current auction state
      let playerId = payload?.playerId;

      if (!playerId) {
        const currentState = await this.auctionService.getAuctionStatus();
        playerId = currentState.currentPlayerId;

        if (!playerId) {
          throw new Error('No player currently in auction');
        }

        this.logger.log(`Using current player ID: ${playerId}`);
      }

      const result = await this.auctionService.sellPlayer(playerId);

      return {
        event: 'playerSold',
        data: {
          success: true,
          ...result,
        },
      };
    } catch (error) {
      this.logger.error(`Error selling player: ${error.message}`);
      this.broadcastError({
        message: error.message,
        code: 'SELL_PLAYER_ERROR',
      });
      return {
        event: 'sellPlayerError',
        data: {
          success: false,
          error: error.message,
        },
      };
    }
  }

  // ==================== BROADCAST METHODS ====================

  /**
   * Broadcast auction state update to all connected clients
   */
  broadcastStateUpdate(stateData: any) {
    this.logger.log('Broadcasting state update');
    this.server.emit('stateUpdate', stateData);
  }

  /**
   * Broadcast timer update to all connected clients
   */
  broadcastTimerUpdate(timerData: { timer: number; isRunning: boolean }) {
    this.server.emit('timerUpdate', timerData);
  }

  /**
   * Broadcast auction started event
   */
  broadcastAuctionStarted(auctionData: any) {
    this.logger.log('Broadcasting auction started');
    this.server.emit('auctionStarted', auctionData);
  }

  /**
   * Broadcast new bid placed event
   */
  broadcastBidPlaced(bidData: any) {
    this.logger.log('Broadcasting bid placed');
    this.server.emit('bidPlaced', bidData);
  }

  /**
   * Broadcast player sold event
   */
  broadcastPlayerSold(soldData: any) {
    this.logger.log('Broadcasting player sold');
    this.server.emit('playerSold', soldData);
  }

  /**
   * Broadcast auction ended event
   */
  broadcastAuctionEnded(endData: any) {
    this.logger.log('Broadcasting auction ended');
    this.server.emit('auctionEnded', endData);
  }

  /**
   * Broadcast error to all clients
   */
  broadcastError(error: { message: string; code?: string }) {
    this.logger.error(`Broadcasting error: ${error.message}`);
    this.server.emit('auctionError', error);
  }

  // ==================== HELPER METHODS ====================

  /**
   * Send current auction state to a specific client
   */
  private async sendCurrentStateToClient(client: Socket) {
    try {
      const currentState = await this.auctionService.getAuctionStatus();
      client.emit('stateUpdate', currentState);
      this.logger.log(`Sent current state to client ${client.id}`);
    } catch (error) {
      this.logger.error(`Error sending state to client: ${error.message}`);
    }
  }

  /**
   * Get connected clients count
   */
  getConnectedClientsCount(): number {
    return this.server.sockets.sockets.size;
  }
}
