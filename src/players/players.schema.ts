import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PlayerDocument = Player & Document;

export enum PlayerStatus {
  PENDING = 'pending',
  AUCTIONING = 'auctioning',
  SOLD = 'sold',
}

@Schema({ timestamps: true })
export class Player {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  position: string; // Comma-separated values: Goal Keeper,Forward,Midfielder,Defender

  @Prop({ required: true })
  basePrice: number;

  @Prop({ default: null })
  finalPrice: number;

  @Prop({ type: String, ref: 'Team', default: null })
  boughtBy: string;

  @Prop({ required: false })
  image?: string;

  @Prop({
    type: String,
    enum: Object.values(PlayerStatus),
    default: PlayerStatus.PENDING,
  })
  status: PlayerStatus;
}

export const PlayerSchema = SchemaFactory.createForClass(Player);
