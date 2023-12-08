import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Coupon } from 'src/entities/Coupon';
import { Repository } from 'typeorm';
import { RedeemCouponDto } from './dto/redeemCoupon.dto';
import { PlayerCoupon } from 'src/entities/PlayerCoupon';
import { RewardService } from '../reward/reward.service';
import { PlayerService } from '../player/player.service';
import { IPlayer } from '../player/interface/player.interface';
import { ICoupon } from './interface/coupon.interface';
import { IReward } from '../reward/interface/reward.interface';
import { Between } from 'typeorm';
import { ExceptionHelper } from 'src/common/helpers/exception.helper';
import { IPlayerCoupon } from './interface/couponPlayer.interface';
import { NestHelper } from 'src/common/helpers/Nest.helper';
import { Player } from 'src/entities/Player';
import { Reward } from 'src/entities/Reward';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon) private couponRepository: Repository<Coupon>,
    @InjectRepository(PlayerCoupon)
    private playerCouponRepository: Repository<PlayerCoupon>,
    private readonly rewardService: RewardService,
    private readonly playerService: PlayerService,
  ) {}
  /**
   *
   * @param redeemPayload
   *
   * validation process:
   *    1. is player is exist by playerId?
   *    2. check reward is exist and valid or not?
   *    3. is player daily limit exceed?
   *    4. is player total(7 days 21 coupon) limit exceed?
   *    5. check already used or not?
   *    6. add new couponPlayer entry after successfully valid above steps
   */
  async redeemCoupon(redeemPayload: RedeemCouponDto) {
    const player = await this.playerService.isPlayerExist(
      redeemPayload?.playerId,
    );
    const reward = await this.rewardService.isValidReward(
      redeemPayload?.rewardId,
    );

    await this.validateRewardLimitsForPlayer(player.id, reward);
    const redeem = await this.couponAlreadyRedeemed(player, reward);

    if (redeem == false) {
      const coupon = await this.getCoupon(reward);

      return this.addPlayerCoupon(player, coupon);
    } else {
      ExceptionHelper.getInstance().defaultError(
        'Already redeem coupon',
        'Already_redeem_coupon',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  private async getCoupon(reward: IReward): Promise<ICoupon> {
    const couponObj = {
      value: String(this.getRandomInt(1, 100)),
      Reward: reward,
    };
    const coupon = await this.couponRepository.save(couponObj);
    return coupon;
  }

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async alreadyRedeemCoupon(player: IPlayer, reward: IReward) {}
  /**
   * Checks if a coupon has already been redeemed by a player.
   *
   * @param id - The unique identifier of the coupon to check for redemption.
   * @param playerId - The unique identifier of the player whose redemption status is being checked.
   * @returns A boolean indicating whether the coupon has already been redeemed by the player.
   */
  async couponAlreadyRedeemed(
    reward: IReward,
    player: IPlayer,
  ): Promise<boolean> {
    // Find a redeemed coupon with the given coupon and player IDs.
    const redeemedCoupon = await this.playerCouponRepository.findOneBy({
      coupon: {
        Reward: {
          id: reward.id,
        },
      },
      player: {
        id: player.id,
      },
    });

    if (!NestHelper.getInstance().isEmpty(redeemedCoupon)) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Creates a new PlayerCoupon record to associate a player with a coupon.
   *
   * @param playerId - The unique identifier of the player to associate with the coupon.
   * @param couponId - The unique identifier of the coupon to associate with the player.
   */
  private async addPlayerCoupon(
    player: IPlayer,
    coupon: ICoupon,
  ): Promise<IPlayerCoupon> {
    const now = new Date();
    const playerObj: Player = {
      id: player.id,
      name: player.name,
    };
    const reward: Reward = {
      id: coupon.Reward.id,
      name: coupon.Reward.name,
      startDate: coupon.Reward.startDate,
      endDate: coupon.Reward.endDate,
      perDayLimit: coupon.Reward.perDayLimit,
      totalLimit: coupon.Reward.totalLimit,
    };
    const couponObj: Coupon = {
      id: coupon.id,
      value: coupon.value,
      Reward: reward,
    };

    let playerCouponObj = {
      player: playerObj,
      coupon: couponObj,
      redeemedAt: now,
    };
    let playerCoupon: IPlayerCoupon =
      await this.playerCouponRepository.save(playerCouponObj);
    return playerCoupon;
  }

  /**
   * Validates reward redemption limits for a player, including daily and total redemption limits.
   *
   * @param playerId - The unique identifier of the player whose redemption limits are being validated.
   * @param reward - The reward for which redemption limits are checked.
   * @throws BadRequestException if the daily or total redemption limits are exceeded.
   */
  private async validateRewardLimitsForPlayer(
    playerId: number,
    reward: IReward,
  ): Promise<void> {
    const { startOfDay, endOfDay } = this.getStartAndEndOfDay();

    // Count the number of redemptions by the player on the current day.
    const dailyRedeem = await this.countRedemptions(playerId, reward.id, {
      redeemedAt: Between(startOfDay, endOfDay),
    });

    // Check if the daily redemption limit is exceeded. If so, throw an exception.
    this.checkRedemptionLimit(
      dailyRedeem,
      reward.perDayLimit,
      'Daily',
      'Redeemtion daily limit exceed',
    );

    // Count the total number of redemptions by the player.
    const totalRedeem = await this.countRedemptions(playerId, reward.id);

    // Check if the total redemption limit is exceeded. If so, throw an exception.
    this.checkRedemptionLimit(
      totalRedeem,
      reward.totalLimit,
      'Total',
      'Redeemtion total limit exceed',
    );
  }

  /**
   * Counts the number of redemptions based on the provided conditions.
   *
   * @param playerId - The unique identifier of the player.
   * @param rewardId - The unique identifier of the reward.
   * @param conditions - Additional conditions for counting redemptions.
   * @returns The count of redemptions.
   */
  private async countRedemptions(
    playerId: number,
    rewardId: number,
    conditions?: any,
  ): Promise<number> {
    return this.playerCouponRepository.count({
      where: {
        player: { id: playerId },
        coupon: { Reward: { id: rewardId } },
        ...conditions,
      },
    });
  }

  /**
   * Checks if the redemption limit is exceeded and throws a BadRequestException if true.
   *
   * @param redemptionCount - The count of redemptions.
   * @param limit - The redemption limit.
   * @param type - The type of redemption limit (e.g., 'Daily', 'Total').
   * @throws BadRequestException if the redemption limit is exceeded.
   */
  private checkRedemptionLimit(
    redemptionCount: number,
    limit: number,
    type: string,
    message: string,
  ): void {
    if (redemptionCount >= limit) {
      ExceptionHelper.getInstance().defaultError(
        message,
        message.split(' ').join('_'),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  getStartAndEndOfDay() {
    // const { startOfDay, endOfDay } = this.getStartAndEndOfDay();
    const date = new Date();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return { startOfDay, endOfDay };
  }
}
