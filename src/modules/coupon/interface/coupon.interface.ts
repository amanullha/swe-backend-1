import { IPlayer } from 'src/modules/player/interface/player.interface';
import { IReward } from 'src/modules/reward/interface/reward.interface';

export interface ICoupon {
  id?: number;
  // player?: IPlayer;
  value?: string;
  Reward?: IReward;
}
