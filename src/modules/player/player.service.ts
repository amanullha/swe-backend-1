import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from 'src/entities/Player';
import { IPlayer } from './interface/player.interface';
import { NestHelper } from 'src/common/helpers/Nest.helper';
import { ExceptionHelper } from 'src/common/helpers/exception.helper';

/**
 * Service responsible for managing players.
 *
 * This service handles the creation and retrieval of player information.
 */
@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(Player) private playerRepository: Repository<Player>,
  ) {}

  /**
   * Create a new player.
   *
   * @author Aman
   * @param payload - The data required to create a player (name).
   * @returns The newly created player.
   */
  async create(payload: CreateUserDto): Promise<IPlayer> {
    const playerObject = await this.constructPlayerObject(payload);
    const player: IPlayer = await this.playerRepository.save(playerObject);
    return player;
  }

  /**
   * Get all players in the system.
   *
   * @author Aman
   * @description Retrieve a list of all players.
   * @returns A Promise resolving to an array of players.
   */
  async getAll(): Promise<IPlayer[]> {
    const players: IPlayer[] = await this.playerRepository.find();
    return players;
  }
  /**
   * Retrieve a player by reward id.
   *@Param player id is required
   * @returns player
   */
  async getPlayerById(id: number): Promise<IPlayer> {
    const reward: IPlayer = await this.playerRepository.findOneBy({ id });
    return reward;
  }

    /**
   * check a player is exist or not in our system database by playerId
   *@Param player id is required
   *@returns player if exist, otherwise return error
   */
  async isPlayerExist(playerId: number): Promise<IPlayer> {
    const player = await this.getPlayerById(playerId);
    if (NestHelper.getInstance().isEmpty(player)) {
      ExceptionHelper.getInstance().defaultError(
        "Player doesn't exist",
        "Player_doesn't_exist",
        HttpStatus.NOT_FOUND,
      );
    } else {
      return player;
    }
  }

  /**
   * Construct a player object with necessary information.
   *
   * @param payload - The data required to create a player (name).
   * @returns A Promise resolving to the constructed player object.
   */
  private async constructPlayerObject(
    payload: CreateUserDto,
  ): Promise<IPlayer> {
    const player: IPlayer = {
      name: payload.name,
    };
    return player;
  }
}
