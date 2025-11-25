import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuctionService } from './auction.service';
import { PlaceBidDto } from './dto/place-bid.dto';

@Controller('auction')
export class AuctionController {
  constructor(private readonly auctionService: AuctionService) {}

  @Post('start/:playerId')
  async startAuction(@Param('playerId') playerId: string) {
    return this.auctionService.startAuction(playerId);
  }

  @Post('bid')
  async placeBid(@Body() placeBidDto: PlaceBidDto) {
    return this.auctionService.placeBid(
      placeBidDto.teamId,
      placeBidDto.playerId,
      placeBidDto.bidAmount,
    );
  }

  @Post('end/:playerId')
  async endAuction(@Param('playerId') playerId: string) {
    return this.auctionService.endAuction(playerId);
  }

  @Get('status')
  async getAuctionStatus() {
    return this.auctionService.getAuctionStatus();
  }

  @Get('bid-increment')
  async getBidIncrement() {
    return { bidIncrement: this.auctionService.getBidIncrement() };
  }

  @Post('reset')
  @HttpCode(HttpStatus.OK)
  async resetAuction() {
    await this.auctionService.resetAuction();
    return { message: 'Auction reset successfully' };
  }
}
