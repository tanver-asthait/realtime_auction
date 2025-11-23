import { IsString, IsNumber, Min } from 'class-validator';

export class PlaceBidDto {
  @IsString()
  teamId: string;

  @IsString()
  playerId: string;

  @IsNumber()
  @Min(0)
  bidAmount: number;
}
