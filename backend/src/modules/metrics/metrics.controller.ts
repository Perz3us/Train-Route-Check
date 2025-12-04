import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('metrics')
@UseGuards(JwtAuthGuard)
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  async getSystemMetrics() {
    return await this.metricsService.getSystemMetrics();
  }

  @Get('route/:trainNumber')
  async getRoutePerformance(
    @Param('trainNumber') trainNumber: string,
    @Query('daysBack') daysBack?: number,
  ) {
    return await this.metricsService.getRoutePerformance(
      trainNumber,
      daysBack ? parseInt(daysBack as any) : 7,
    );
  }
}