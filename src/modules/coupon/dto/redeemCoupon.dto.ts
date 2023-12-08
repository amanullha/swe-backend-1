import { IsNotEmpty } from 'class-validator';
export class RedeemCouponDto {
  @IsNotEmpty({ message: 'playerId_empty' })
  playerId: number;

  @IsNotEmpty({ message: 'rewardId_empty' })
  rewardId: number;
}
