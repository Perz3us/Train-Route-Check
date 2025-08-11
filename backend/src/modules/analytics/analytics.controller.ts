import { Controller, Get, Query, Param } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('popular-routes')
  async getPopularRoutes(@Query('daysBack') daysBack?: number) {
    return await this.analyticsService.getPopularRoutes(
      daysBack ? parseInt(daysBack as any) : 30,
    );
  }

  @Get('route-delays')
  async getRouteDelays(
    @Query('trainNumber') trainNumber?: string,
    @Query('daysBack') daysBack?: number,
  ) {
    return await this.analyticsService.calculateRouteDelays(
      trainNumber,
      daysBack ? parseInt(daysBack as any) : 7,
    );
  }

  @Get('train-performance/:trainNumber')
  async getTrainPerformance(@Param('trainNumber') trainNumber: string) {
    return await this.analyticsService.getTrainPerformance(trainNumber);
  }

  @Get('system-health')
  async getSystemHealth() {
    return await this.analyticsService.getSystemHealth();
  }
}