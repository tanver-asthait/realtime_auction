import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PlayersService } from './players.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { PlayerStatus } from './players.schema';

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get()
  async findAll() {
    return this.playersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.playersService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPlayerDto: CreatePlayerDto) {
    return this.playersService.create(createPlayerDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePlayerDto: UpdatePlayerDto,
  ) {
    return this.playersService.update(id, updatePlayerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    return this.playersService.delete(id);
  }

  @Get('status/:status')
  async findByStatus(@Param('status') status: PlayerStatus) {
    return this.playersService.findByStatus(status);
  }

  @Get('team/:teamId')
  async findByTeam(@Param('teamId') teamId: string) {
    console.log(`Fetching players for team ID: ${teamId}`);
    return this.playersService.findByTeam(teamId);
  }

  @Post('actions/reset-all')
  @HttpCode(HttpStatus.OK)
  async resetAllPlayersToPending() {
    console.log('Resetting all players to PENDING status');
    return this.playersService.resetAllPlayersToPending();
  }
}
