import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reward } from 'src/entities/Reward';
import { Repository } from 'typeorm';
import { CreateRewardDto } from './dto/createReward.dto';
import { ExceptionHelper } from 'src/common/helpers/exception.helper';
import { IReward } from './interface/reward.interface';
import { NestHelper } from 'src/common/helpers/Nest.helper';

/**
 * Service responsible for managing rewards.
 *
 * This service handles the creation of rewards with necessary information.
 * It validates and ensures the correctness of the provided date range.
 */
@Injectable()
export class RewardService {
  constructor(
    @InjectRepository(Reward) private rewardRepository: Repository<Reward>,
  ) {}

  /**
   * Create a new reward with necessary information.
   *
   * @author Aman
   * @param payload - The data required to create a reward (name, startDate, endDate, perDayLimit, totalLimit).
   * @returns The newly created reward.
   */
  async create(payload: CreateRewardDto): Promise<IReward> {
    // Validate and adjust the date range
    const { startDate, endDate } = this.validateAndAdjustDateRange(payload);

    // Create the reward object
    const rewardObj: IReward = {
      name: payload.name ?? '',
      startDate: startDate,
      endDate: endDate,
      perDayLimit: payload?.perDayLimit ?? 0,
      totalLimit: payload?.totalLimit ?? 0,
    };

    // Save the reward to the database
    const reward = await this.rewardRepository.save(rewardObj);

    return reward;
  }
  /**
   * Retrieve all rewards stored in the system.
   *
   * @returns array of rewards.
   */
  async getAllRewards(): Promise<IReward[]> {
    const rewards: IReward[] = await this.rewardRepository.find();
    return rewards;
  }
  /**
   * Retrieve a reward by reward id.
   *@Param reward id is required
   * @returns reward.
   */
  async getRewardById(id: number): Promise<IReward> {
    const reward: IReward = await this.rewardRepository.findOneBy({ id });
    return reward;
  }

  /**
   * check a reward is exist or not, reward time stated or not and reward is ended or not in our system database by rewardId
   *@Param reward id is required
   *@returns reward if exist date range is valid(startDate<=now<=endDate), otherwise return error
   */
  async isValidReward(rewardId: number): Promise<IReward> {
    const reward = await this.getRewardById(rewardId);
    if (NestHelper.getInstance().isEmpty(reward)) {
      ExceptionHelper.getInstance().defaultError(
        "Reward doesn't exist",
        "Reward_doesn't_exist",
        HttpStatus.NOT_FOUND,
      );
    }

    // Retrieve the current timestamp and compare it with the end date of the reward to determine if it has expired.    const now = Date.now();
    const startDate = new Date(reward.startDate).getTime();
    const endDate = new Date(reward.endDate).getTime();
    const now = new Date().getTime();

    // If the reward has not yet started, raise an exception to indicate that it is not yet active.
    // comparing with time not just date
    if (startDate > now) {
      ExceptionHelper.getInstance().defaultError(
        'The reward has not started yet',
        'The_reward_has_not_started_yet',
        HttpStatus.BAD_REQUEST,
      );
    }

    // If the reward has expired, raise an exception to indicate that it has expired.
    // comparing with time not just date
    if (now > endDate) {
      ExceptionHelper.getInstance().defaultError(
        'The reward has expired',
        'The_reward_has_expired',
        HttpStatus.BAD_REQUEST,
      );
    }

    return reward;
  }

  /**
   * Validate and adjust the incoming date range.
   * If the date range is invalid, an exception is thrown.
   *
   * @param payload - The data required to create a reward (name, startDate, endDate, perDayLimit, totalLimit).
   * @returns An object containing the validated and adjusted start and end dates.
   * @throws An exception if the date range is invalid.
   */
  private validateAndAdjustDateRange(payload: CreateRewardDto): {
    startDate: Date;
    endDate: Date;
  } {
    const startDate = this.isValidDate(payload?.startDate)
      ? new Date(payload.startDate)
      : new Date();

    const endDate = this.isValidDate(payload?.endDate)
      ? new Date(payload.endDate)
      : new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Check if the end date is before the start date
    if (endDate < startDate) {
      ExceptionHelper.getInstance().defaultError(
        'Invalid date format',
        'Invalid_date_format',
        HttpStatus.BAD_REQUEST,
      );
    }

    return { startDate, endDate };
  }

  /**
   * Check if a given value is a valid date.
   *
   * @param value - The value to be checked.
   * @returns A boolean indicating whether the value is a valid date.
   */
  private isValidDate(value: any): boolean {
    let date = new Date(value);
    return date instanceof Date && !isNaN(date.getTime());
  }
}
