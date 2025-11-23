import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Team, TeamDocument } from './teams.schema';

@Injectable()
export class TeamsService {
  constructor(@InjectModel(Team.name) private teamModel: Model<TeamDocument>) {}

  // TODO: Implement service methods
  // - findAll()
  // - findOne(id)
  // - create(createTeamDto)
  // - update(id, updateTeamDto)
  // - delete(id)
  // - addPlayerToTeam(teamId, playerId, playerPrice)
  // - updateBudget(teamId, amount)
}
