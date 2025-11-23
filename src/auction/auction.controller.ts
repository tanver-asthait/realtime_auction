import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AuctionService } from './auction.service';

@Controller('auction')
export class AuctionController {
  constructor(private readonly auctionService: AuctionService) {}

  // TODO: Implement controller endpoints
  // @Post('start/:playerId') - Start auction for a player
  // @Post('bid') - Place a bid
  // @Post('end/:playerId') - End auction for a player
  // @Get('status') - Get current auction status
  // @Post('reset') - Reset auction
}
