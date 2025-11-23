import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PlayerDocument = Player & Document;

@Schema({ timestamps: true })
export class Player {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  position: string;

  @Prop({ required: true })
  basePrice: number;

  @Prop({ default: null })
  soldPrice: number;

  @Prop({ type: String, ref: 'Team', default: null })
  teamId: string;

  @Prop({ default: 'unsold' })
  status: string; // 'unsold', 'sold', 'in-auction'

  @Prop()
  imageUrl: string;

  @Prop()
  stats: {
    matches?: number;
    goals?: number;
    assists?: number;
  };
}

export const PlayerSchema = SchemaFactory.createForClass(Player);
