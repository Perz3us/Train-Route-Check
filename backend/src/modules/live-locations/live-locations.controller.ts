import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  DefaultValuePipe,
  Query,
  Logger,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { LiveLocationsService } from './live-locations.service';
import { LiveLocationDto } from './dto/live-location.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('live-locations')
@UseGuards(JwtAuthGuard)
export class LiveLocationsController {
  private readonly logger = new Logger(LiveLocationsController.name);

  constructor(private readonly liveLocationsService: LiveLocationsService) {}

  @Post()
  async createOrUpdateLocation(@Body(ValidationPipe) locationDto: LiveLocationDto) {
    try {
      const result = await this.liveLocationsService.createOrUpdateLocation(locationDto);
      return {
        success: true,
        data: result,
        message: 'Location updated successfully',
      };
    } catch (error) {
      this.logger.error(`Error in createOrUpdateLocation: ${error.message}`);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Get('train/:trainNumber/latest')
  async getLatestLocation(@Param('trainNumber') trainNumber: string) {
    try {
      const location = await this.liveLocationsService.getLatestLocation(trainNumber);
      return {
        success: true,
        data: location,
        message: location 
          ? 'Latest location retrieved successfully' 
          : 'No location found for this train',
      };
    } catch (error) {
      this.logger.error(`Error in getLatestLocation: ${error.message}`);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Get('train/:trainNumber')
  async getLocationsByTrain(
    @Param('trainNumber') trainNumber: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    try {
      const locations = await this.liveLocationsService.getLocationsByTrain(trainNumber, limit);
      return {
        success: true,
        data: locations,
        message: 'Locations retrieved successfully',
      };
    } catch (error) {
      this.logger.error(`Error in getLocationsByTrain: ${error.message}`);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Post('archive')
  async archiveOldLocations() {
    try {
      const result = await this.liveLocationsService.archiveOldLocations();
      return {
        success: true,
        data: result,
        message: `Archived ${result.archived} old location records`,
      };
    } catch (error) {
      this.logger.error(`Error in archiveOldLocations: ${error.message}`);
      return {
        success: false,
        message: error.message,
      };
    }
  }
}