import { IsString, IsNumber, IsEnum, IsOptional, Min, Matches } from 'class-validator';
import { PlayerStatus } from '../players.schema';

export class UpdatePlayerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(Goal Keeper|Forward|Midfielder|Defender)(,(Goal Keeper|Forward|Midfielder|Defender))*$/, {
    message: 'Position must be one or more of: Goal Keeper, Forward, Midfielder, Defender (comma-separated)',
  })
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
  @IsString()
  @Matches(/^data:image\/(png|jpg|jpeg|gif|webp);base64,/, {
    message: 'Image must be a valid base64 encoded image (png, jpg, jpeg, gif, or webp)',
  })
  image?: string;

  @IsOptional()
  @IsEnum(PlayerStatus)
  status?: PlayerStatus;
}
