import { Coupon } from 'src/entities/Coupon';
import { IPlayer } from 'src/modules/player/interface/player.interface';
import { IReward } from 'src/modules/reward/interface/reward.interface';
import { ICoupon } from './coupon.interface';

export interface IPlayerCoupon {
  id?: number;
  player?: IPlayer;
  coupon?: ICoupon;
  redeemedAt?: Date;
}
