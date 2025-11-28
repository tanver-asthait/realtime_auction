import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuctionStateDocument = AuctionState & Document;

@Schema({ timestamps: true })
export class AuctionState {
  @Prop({ type: String, ref: 'Player', default: null })
  currentPlayerId: string;

  @Prop({ default: 0 })
  highestBid: number;

  @Prop({ type: String, ref: 'Team', default: null })
  highestBidTeamId: string;

  @Prop({ default: 0 })
  timer: number;

  @Prop({ default: false })
  isRunning: boolean;
}

export const AuctionStateSchema = SchemaFactory.createForClass(AuctionState);
