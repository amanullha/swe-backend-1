import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RewardService } from './reward.service';
import { CreateRewardDto } from './dto/createReward.dto';
import { IReward } from './interface/reward.interface';

@Controller('reward')
export class RewardController {
  constructor(private readonly rewardService: RewardService) {}

  @Post()
  async create(@Body() payload: CreateRewardDto): Promise<IReward> {
    return await this.rewardService.create(payload);
  }

  @Get()
  async getAllRewards(): Promise<IReward[]> {
    return await this.rewardService.getAllRewards();
  }
  @Get(':id')
  async getRewardById(@Param('id') id: number): Promise<IReward> {
    return await this.rewardService.getRewardById(id);
  }
}
