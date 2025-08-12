import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface SystemMetrics {
  activeTrains: number;
  avgBattery: number;
  avgSignal: number;
  routesActive: number;
}

export function useSystemMetrics() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      // Get real-time train count
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { count: activeTrains } = await supabase
        .from('live_locations')
        .select('train_number', { count: 'exact', head: true })
        .gte('timestamp', fiveMinutesAgo);

      // Get route performance (in this case, just the number of active routes)
      const { count: routesActive } = await supabase
        .from('routes')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get system health
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const { data: systemHealth, error } = await supabase
        .from('live_locations')
        .select('device_id, battery_level, signal_strength')
        .gte('timestamp', tenMinutesAgo);

      if (error) {
        console.error('Error fetching system health:', error);
      }

      const avgBattery = systemHealth?.reduce((sum, d) => sum + (d.battery_level || 0), 0) / (systemHealth?.length || 1);
      const avgSignal = systemHealth?.reduce((sum, d) => sum + (d.signal_strength || 0), 0) / (systemHealth?.length || 1);

      setMetrics({
        activeTrains: activeTrains || 0,
        routesActive: routesActive || 0,
        avgBattery: avgBattery || 0,
        avgSignal: avgSignal || 0,
      });

      setLoading(false);
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return { metrics, loading };
}
