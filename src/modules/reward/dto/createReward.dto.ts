// reward.dto.ts
import { IsNotEmpty, IsNumber, IsDate } from 'class-validator';

export class CreateRewardDto {
  @IsNotEmpty({ message: 'name_empty' })
  name: string;

  @IsNotEmpty({ message: 'startDate_emtpy' })
  @IsDate()
  startDate: Date;

  @IsNotEmpty({ message: 'endDate_emtpy' })
  @IsDate()
  endDate: Date;

  @IsNotEmpty({ message: 'perDayLimt_emtpy' })
  @IsNumber()
  perDayLimit: number;

  @IsNotEmpty({ message: 'totalLimit_emtpy' })
  @IsNumber()
  totalLimit: number;
}
