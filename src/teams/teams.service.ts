import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Team, TeamDocument } from './teams.schema';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(@InjectModel(Team.name) private teamModel: Model<TeamDocument>) {}

  async findAll(): Promise<Team[]> {
    return this.teamModel.find().populate('players').exec();
  }

  async findOne(id: string): Promise<Team> {
    const team = await this.teamModel.findById(id).populate('players').exec();
    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }
    return team;
  }

  async create(createTeamDto: CreateTeamDto): Promise<Team> {
    const newTeam = new this.teamModel({
      ...createTeamDto,
      budget: createTeamDto.budget || 100,
    });
    return newTeam.save();
  }

  async update(id: string, updateTeamDto: UpdateTeamDto): Promise<Team> {
    const updatedTeam = await this.teamModel
      .findByIdAndUpdate(id, updateTeamDto, { new: true })
      .populate('players')
      .exec();
    if (!updatedTeam) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }
    return updatedTeam;
  }

  async delete(id: string): Promise<void> {
    const result = await this.teamModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }
  }

  async addPlayerToTeam(
    teamId: string,
    playerId: string,
    playerPrice: number,
  ): Promise<Team> {
    const team = await this.teamModel.findById(teamId).exec();
    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    if (team.budget < playerPrice) {
      throw new BadRequestException(
        `Insufficient budget. Team has ${team.budget}, but player costs ${playerPrice}`,
      );
    }

    team.players.push(playerId);
    team.budget -= playerPrice;
    return team.save();
  }

  async removePlayerFromTeam(
    teamId: string,
    playerId: string,
    refundAmount: number,
  ): Promise<Team> {
    const team = await this.teamModel.findById(teamId).exec();
    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    team.players = team.players.filter((id) => id !== playerId);
    team.budget += refundAmount;
    return team.save();
  }

  async updateBudget(teamId: string, amount: number): Promise<Team> {
    const team = await this.teamModel
      .findByIdAndUpdate(teamId, { $inc: { budget: amount } }, { new: true })
      .exec();
    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }
    return team;
  }

  async getTeamPlayers(teamId: string): Promise<any> {
    const team = await this.teamModel
      .findById(teamId)
      .populate('players')
      .exec();
    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }
    return team.players;
  }
}
