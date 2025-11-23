import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TeamDocument = Team & Document;

@Schema({ timestamps: true })
export class Team {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, default: 100 })
  budget: number;

  @Prop({ type: [{ type: String, ref: 'Player' }], default: [] })
  players: string[];
}

export const TeamSchema = SchemaFactory.createForClass(Team);
