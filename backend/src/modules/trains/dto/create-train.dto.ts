import { IsString, IsNotEmpty, IsOptional, IsInt, IsEnum } from 'class-validator';

export class CreateTrainDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  trainNumber: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsInt()
  @IsOptional()
  capacity?: number;

  @IsString()
  @IsOptional()
  status?: string;
}
