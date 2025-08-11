import {
  Controller,
  Get,
  Param,
  Query,
  Logger,
} from '@nestjs/common';
import { EtaService, EtaResult } from './eta.service';

@Controller('eta')
export class EtaController {
  private readonly logger = new Logger(EtaController.name);

  constructor(private readonly etaService: EtaService) {}

  @Get(':trainNumber/destination/:destinationStationId')
  async getEtaToDestination(
    @Param('trainNumber') trainNumber: string,
    @Param('destinationStationId') destinationStationId: string,
  ): Promise<{ success: boolean; data?: EtaResult; message: string }> {
    try {
      const eta = await this.etaService.calculateEta(trainNumber, destinationStationId);
      return {
        success: true,
        data: eta,
        message: 'ETA calculated successfully',
      };
    } catch (error) {
      this.logger.error(`Error in getEtaToDestination: ${error.message}`);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Get(':trainNumber/route')
  async getEtasForRoute(
    @Param('trainNumber') trainNumber: string,
  ): Promise<{ success: boolean; data?: EtaResult[]; message: string }> {
    try {
      const etas = await this.etaService.getEtasForRoute(trainNumber);
      return {
        success: true,
        data: etas,
        message: 'ETAs for route calculated successfully',
      };
    } catch (error) {
      this.logger.error(`Error in getEtasForRoute: ${error.message}`);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Get(':trainNumber/delay')
  async getDelayInfo(
    @Param('trainNumber') trainNumber: string,
  ): Promise<{ success: boolean; data?: any; message: string }> {
    try {
      const delayInfo = await this.etaService.getDelayInfo(trainNumber);
      return {
        success: true,
        data: delayInfo,
        message: 'Delay information retrieved successfully',
      };
    } catch (error) {
      this.logger.error(`Error in getDelayInfo: ${error.message}`);
      return {
        success: false,
        message: error.message,
      };
    }
  }
}