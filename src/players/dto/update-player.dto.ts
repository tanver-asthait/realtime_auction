import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { PlayerStatus } from '../players.schema';

export class UpdatePlayerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  finalPrice?: number;

  @IsOptional()
  @IsString()
  boughtBy?: string;

  @IsOptional()
  @IsEnum(PlayerStatus)
  status?: PlayerStatus;
}
