"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Train, 
  Signal, 
  Route as RouteIcon,
  Clock,
  AlertCircle
} from 'lucide-react';
import { metricsApi, type SystemMetrics } from '@/lib/api';

interface TrainStatus {
  trainNumber: string;
  lastUpdate: string;
  location: {
    latitude: number;
    longitude: number;
    speed: number;
    signal_strength: number | null;
  };
}

interface Alert {
  id: number;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'error';
  timestamp: string;
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [trainStatuses, setTrainStatuses] = useState<TrainStatus[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        console.log('Fetching metrics from:', `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}/metrics`);
        const data = await metricsApi.getSystemMetrics();
        console.log('Received metrics:', data);
        setMetrics(data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching metrics:', err);
        setError(`Failed to load metrics: ${err.message || err}`);
      }
    };

    const fetchTrainStatuses = async () => {
      try {
        // For demo purposes, we'll simulate some train data
        // In a real implementation, you would call an API endpoint to get active trains
        const mockStatuses: TrainStatus[] = [
          {
            trainNumber: "SLR_001",
            lastUpdate: new Date().toISOString(),
            location: {
              latitude: 6.9333,
              longitude: 79.8500,
              speed: 80,
              signal_strength: -65
            }
          },
          {
            trainNumber: "SLR_002",
            lastUpdate: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
            location: {
              latitude: 7.2906,
              longitude: 80.6337,
              speed: 0,
              signal_strength: -70
            }
          }
        ];
        setTrainStatuses(mockStatuses);
      } catch (err: any) {
        console.error('Error fetching train statuses:', err);
      }
    };

    // Initial fetch
    Promise.all([fetchMetrics(), fetchTrainStatuses()]).then(() => {
      setLoading(false);
    });

    // Set up periodic refresh for metrics
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Format time difference
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const updated = new Date(timestamp);
    const diffMs = now.getTime() - updated.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="flex-1 p-6 bg-gray-900">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-400">Overview of system metrics and train status</p>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6">
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p>Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Active Trains Card */}
            <Card className="bg-gray-800 border-gray-700 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Active Trains</CardTitle>
                <Train className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.activeTrains || 0}</div>
                <p className="text-xs text-gray-400">Trains currently running</p>
              </CardContent>
            </Card>

            {/* Avg. Signal Card */}
            <Card className="bg-gray-800 border-gray-700 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Avg. Signal</CardTitle>
                <Signal className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.avgSignal ? `${metrics.avgSignal.toFixed(0)} dBm` : '0 dBm'}</div>
                <p className="text-xs text-gray-400">Average signal strength</p>
              </CardContent>
            </Card>

            {/* Active Routes Card */}
            <Card className="bg-gray-800 border-gray-700 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Active Routes</CardTitle>
                <RouteIcon className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.activeRoutes || 0}</div>
                <p className="text-xs text-gray-400">Routes currently active</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Train Status */}
            <Card className="lg:col-span-2 bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Live Train Status</CardTitle>
                <CardDescription className="text-gray-400">Real-time train tracking information</CardDescription>
              </CardHeader>
              <CardContent>
                {trainStatuses.length > 0 ? (
                  <div className="space-y-4">
                    {trainStatuses.map((status) => (
                      <div key={status.trainNumber} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                        <div className="flex items-center">
                          <div className="bg-primary/20 p-2 rounded-full mr-3">
                            <Train className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{status.trainNumber}</h3>
                            <p className="text-sm text-gray-400">
                              {status.location.latitude.toFixed(4)}, {status.location.longitude.toFixed(4)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{status.location.speed} km/h</p>
                          <p className="text-xs text-gray-400 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTimeAgo(status.lastUpdate)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32">
                    <p className="text-gray-400">No active trains</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* System Alerts */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">System Alerts</CardTitle>
                <CardDescription className="text-gray-400">Important system notifications</CardDescription>
              </CardHeader>
              <CardContent>
                {alerts.length > 0 ? (
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <div key={alert.id} className="p-3 rounded-lg bg-gray-700">
                        <div className="flex items-start">
                          <AlertCircle className={`h-4 w-4 mr-2 mt-0.5 ${
                            alert.severity === 'error' ? 'text-red-400' : 
                            alert.severity === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                          }`} />
                          <div>
                            <h4 className="font-medium text-sm">{alert.title}</h4>
                            <p className="text-xs text-gray-400 mt-1">{alert.description}</p>
                            <p className="text-xs text-gray-500 mt-2">{formatTimeAgo(alert.timestamp)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32">
                    <p className="text-gray-400">No system alerts</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}