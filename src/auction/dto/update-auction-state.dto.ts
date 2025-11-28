import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
} from 'class-validator';

export class UpdateAuctionStateDto {
  @IsOptional()
  @IsString()
  currentPlayerId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  highestBid?: number;

  @IsOptional()
  @IsString()
  highestBidTeamId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  timer?: number;

  @IsOptional()
  @IsBoolean()
  isRunning?: boolean;
}
