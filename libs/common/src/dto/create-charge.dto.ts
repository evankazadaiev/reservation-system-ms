import { IsNumber, IsString } from 'class-validator';

export class CreateChargeDto {
  @IsString()
  token: string;

  @IsNumber()
  amount: number;
}
