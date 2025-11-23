import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Player, PlayerDocument, PlayerStatus } from './players.schema';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';

@Injectable()
export class PlayersService {
  constructor(
    @InjectModel(Player.name) private playerModel: Model<PlayerDocument>,
  ) {}

  async findAll(): Promise<Player[]> {
    return this.playerModel.find().exec();
  }

  async findOne(id: string): Promise<Player> {
    const player = await this.playerModel.findById(id).exec();
    if (!player) {
      throw new NotFoundException(`Player with ID ${id} not found`);
    }
    return player;
  }

  async create(createPlayerDto: CreatePlayerDto): Promise<Player> {
    const newPlayer = new this.playerModel(createPlayerDto);
    return newPlayer.save();
  }

  async update(id: string, updatePlayerDto: UpdatePlayerDto): Promise<Player> {
    const updatedPlayer = await this.playerModel
      .findByIdAndUpdate(id, updatePlayerDto, { new: true })
      .exec();
    if (!updatedPlayer) {
      throw new NotFoundException(`Player with ID ${id} not found`);
    }
    return updatedPlayer;
  }

  async delete(id: string): Promise<void> {
    const result = await this.playerModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Player with ID ${id} not found`);
    }
  }

  async findByStatus(status: PlayerStatus): Promise<Player[]> {
    return this.playerModel.find({ status }).exec();
  }

  async findNextUnsold(): Promise<PlayerDocument | null> {
    // Find the first player with status PENDING (unsold)
    return this.playerModel.findOne({ status: PlayerStatus.PENDING }).exec();
  }

  async assignToTeam(
    playerId: string,
    teamId: string,
    finalPrice: number,
  ): Promise<Player> {
    const player = await this.playerModel
      .findByIdAndUpdate(
        playerId,
        {
          boughtBy: teamId,
          finalPrice,
          status: PlayerStatus.SOLD,
        },
        { new: true },
      )
      .exec();
    if (!player) {
      throw new NotFoundException(`Player with ID ${playerId} not found`);
    }
    return player;
  }

  async resetPlayerStatus(playerId: string): Promise<Player> {
    const player = await this.playerModel
      .findByIdAndUpdate(
        playerId,
        {
          boughtBy: null,
          finalPrice: null,
          status: PlayerStatus.PENDING,
        },
        { new: true },
      )
      .exec();
    if (!player) {
      throw new NotFoundException(`Player with ID ${playerId} not found`);
    }
    return player;
  }
}
