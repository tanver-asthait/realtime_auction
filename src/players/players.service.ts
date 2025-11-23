import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Player, PlayerDocument } from './players.schema';

@Injectable()
export class PlayersService {
  constructor(
    @InjectModel(Player.name) private playerModel: Model<PlayerDocument>,
  ) {}

  // TODO: Implement service methods
  // - findAll()
  // - findOne(id)
  // - create(createPlayerDto)
  // - update(id, updatePlayerDto)
  // - delete(id)
  // - findByStatus(status)
  // - assignToTeam(playerId, teamId, soldPrice)
}
