import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { SupabaseService } from '../../database/supabase/supabase.service';

export interface SystemMetrics {
  activeTrains: number;
  totalRoutes: number;
  activeRoutes: number;
  totalStations: number;
  avgBattery: number;
  avgSignal: number;
  totalLocationPoints: number;
}

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);

  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
  ) {}

  async getSystemMetrics(): Promise<SystemMetrics> {
    try {
      // Get active trains count (trains with location updates in last 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      
      const { count: activeTrains } = await this.supabase.client
        .from('live_locations')
        .select('train_number', { count: 'exact', head: true })
        .gte('timestamp', fiveMinutesAgo);

      // Get route stats
      const [totalRoutes, activeRoutes, totalStations, totalLocationPoints] = await Promise.all([
        this.prisma.route.count(),
        this.prisma.route.count({ where: { isActive: true } }),
        this.prisma.station.count(),
        this.prisma.liveLocation.count(),
      ]);

      // Get system health metrics
      const { data: systemHealth } = await this.supabase.client
        .from('live_locations')
        .select('device_id, battery_level, signal_strength')
        .gte('timestamp', new Date(Date.now() - 10 * 60 * 1000).toISOString()); // Last 10 minutes

      const avgBattery = systemHealth?.length
        ? systemHealth.reduce((sum, d) => sum + (d.battery_level || 0), 0) / systemHealth.length
        : 0;

      const avgSignal = systemHealth?.length
        ? systemHealth.reduce((sum, d) => sum + (d.signal_strength || 0), 0) / systemHealth.length
        : 0;

      return {
        activeTrains: activeTrains || 0,
        totalRoutes,
        activeRoutes,
        totalStations,
        avgBattery,
        avgSignal,
        totalLocationPoints,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch system metrics: ${error.message}`);
      throw error;
    }
  }

  async getRoutePerformance(trainNumber: string, daysBack: number = 7) {
    try {
      // This would be implemented with a custom Supabase function or complex query
      // For now, we'll return a simplified version
      const route = await this.prisma.route.findUnique({
        where: { trainNumber },
        include: {
          routeStations: {
            include: { station: true },
            orderBy: { sequence: 'asc' },
          },
        },
      });

      if (!route) {
        throw new Error(`Route with train number ${trainNumber} not found`);
      }

      return {
        trainNumber,
        routeName: route.name,
        isActive: route.isActive,
        stationCount: route.routeStations.length,
        // In a real implementation, you would calculate delays and performance metrics
        avgDelayMinutes: 0,
        onTimePercentage: 100,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch route performance: ${error.message}`);
      throw error;
    }
  }
}