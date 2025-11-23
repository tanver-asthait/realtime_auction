import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TeamDocument = Team & Document;

@Schema({ timestamps: true })
export class Team {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  budget: number;

  @Prop({ default: 0 })
  remainingBudget: number;

  @Prop({ type: [{ type: String, ref: 'Player' }], default: [] })
  players: string[];

  @Prop({ default: 0 })
  playerCount: number;

  @Prop()
  logoUrl: string;

  @Prop()
  ownerName: string;
}

export const TeamSchema = SchemaFactory.createForClass(Team);
