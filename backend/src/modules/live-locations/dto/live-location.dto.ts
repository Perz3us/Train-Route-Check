import {
  IsString,
  IsNumber,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsISO8601,
} from 'class-validator';

export class LiveLocationDto {
  @IsString()
  trainNumber: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  speed?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(360)
  heading?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  accuracy?: number;

  @IsOptional()
  @IsString()
  deviceId?: string;

  @IsISO8601()
  timestamp: string;
}