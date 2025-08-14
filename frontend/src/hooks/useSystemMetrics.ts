import { useState, useEffect } from 'react';

interface SystemMetrics {
  activeTrains: number;
  avgBattery: number;
  avgSignal: number;
  totalRoutes: number;
  activeRoutes: number;
  totalStations: number;
  totalLocationPoints: number;
}

export function useSystemMetrics() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/metrics');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch metrics: ${response.status}`);
        }
        
        const data = await response.json();
        
        setMetrics({
          activeTrains: data.activeTrains || 0,
          avgBattery: data.avgBattery || 0,
          avgSignal: data.avgSignal || 0,
          totalRoutes: data.totalRoutes || 0,
          activeRoutes: data.activeRoutes || 0,
          totalStations: data.totalStations || 0,
          totalLocationPoints: data.totalLocationPoints || 0,
        });
      } catch (error) {
        console.error('Error fetching system metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return { metrics, loading };
}
