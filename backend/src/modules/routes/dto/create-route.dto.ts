import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsUUID,
  IsNumber,
  Min,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RouteStationDto {
  @IsUUID()
  stationId: string;

  @IsNumber()
  @Min(1)
  sequence: number;

  @IsNumber()
  @Min(0)
  distanceFromStart: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedDuration?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stopDuration?: number;
}

export class CreateRouteDto {
  @IsString()
  trainNumber: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime must be in HH:MM format (e.g., 06:30)',
  })
  startTime?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime must be in HH:MM format (e.g., 09:45)',
  })
  endTime?: string; // Format: "HH:MM"

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RouteStationDto)
  stations: RouteStationDto[];
}
