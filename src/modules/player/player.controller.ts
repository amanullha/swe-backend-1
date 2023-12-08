import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PlayerService } from './player.service';
import { CreateUserDto } from './dto/createUser.dto';
import { IPlayer } from './interface/player.interface';

@Controller('player')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Post()
  async create(@Body() payload: CreateUserDto): Promise<IPlayer> {
    return await this.playerService.create(payload);
  }

  @Get()
  async getAll(): Promise<IPlayer[]> {
    return await this.playerService.getAll();
  }

  @Get(":id")
  async getPlayerById(@Param("id")id:number): Promise<IPlayer> {
    return await this.playerService.getPlayerById(id);
  }
  
}
