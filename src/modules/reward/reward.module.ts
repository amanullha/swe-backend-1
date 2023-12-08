import { Module } from '@nestjs/common';
import { RewardController } from './reward.controller';
import { RewardService } from './reward.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reward } from 'src/entities/Reward';

@Module({
  imports: [TypeOrmModule.forFeature([Reward])],
  controllers: [RewardController],
  providers: [RewardService],
})
export class RewardModule {}
