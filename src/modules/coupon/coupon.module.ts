import { Module } from '@nestjs/common';
import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';
import { Coupon } from 'src/entities/Coupon';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerCoupon } from 'src/entities/PlayerCoupon';
import { RewardService } from '../reward/reward.service';
import { PlayerService } from '../player/player.service';
import { Reward } from 'src/entities/Reward';
import { Player } from 'src/entities/Player';

@Module({
  imports: [TypeOrmModule.forFeature([Coupon, PlayerCoupon, Reward, Player])],

  controllers: [CouponController],
  providers: [CouponService, RewardService, PlayerService],
})
export class CouponModule {}
