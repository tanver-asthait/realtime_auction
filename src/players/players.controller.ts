import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { PlayersService } from './players.service';

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  // TODO: Implement controller endpoints
  // @Get() - Get all players
  // @Get(':id') - Get player by id
  // @Post() - Create new player
  // @Put(':id') - Update player
  // @Delete(':id') - Delete player
  // @Get('status/:status') - Get players by status
}
