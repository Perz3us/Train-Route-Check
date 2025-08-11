import { IsString, IsNumber, IsDateString } from 'class-validator';

export class EtaResultDto {
  @IsString()
  trainNumber: string;

  @IsString()
  destinationStationId: string;

  @IsDateString()
  estimatedArrival: string;

  @IsNumber()
  distanceToDestination: number;

  @IsNumber()
  estimatedMinutes: number;

  @IsNumber()
  currentSpeed: number;

  @IsDateString()
  lastUpdated: string;
}