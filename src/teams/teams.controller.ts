import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { TeamsService } from './teams.service';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  // TODO: Implement controller endpoints
  // @Get() - Get all teams
  // @Get(':id') - Get team by id
  // @Post() - Create new team
  // @Put(':id') - Update team
  // @Delete(':id') - Delete team
  // @Get(':id/players') - Get team's players
}
