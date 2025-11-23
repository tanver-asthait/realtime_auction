import { Module } from '@nestjs/common';
import { AuctionController } from './auction.controller';
import { AuctionService } from './auction.service';
import { AuctionGateway } from './auction.gateway';
import { PlayersModule } from '../players/players.module';
import { TeamsModule } from '../teams/teams.module';

@Module({
  imports: [PlayersModule, TeamsModule],
  controllers: [AuctionController],
  providers: [AuctionService, AuctionGateway],
  exports: [AuctionService],
})
export class AuctionModule {}
