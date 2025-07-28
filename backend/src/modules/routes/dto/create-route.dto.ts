import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  Matches,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RouteStationDto {
  @IsString()
  @IsNotEmpty()
  stationId: string;

  @IsNotEmpty()
  sequence: number;

  @IsNotEmpty()
  distanceFromStart: number;

  @IsOptional()
  estimatedDuration?: number;

  @IsOptional()
  stopDuration?: number = 2;
}

export class CreateRouteDto {
  @IsString()
  @IsNotEmpty()
  trainNumber: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  startTime?: string;

  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  endTime?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RouteStationDto)
  stations: RouteStationDto[];
}
