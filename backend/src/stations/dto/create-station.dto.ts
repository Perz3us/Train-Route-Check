import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsDecimal,
  Length,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateStationDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 255)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 10)
  code: string;

  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  latitude: number;

  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  longitude: number;

  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  city: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  state: string;
}
