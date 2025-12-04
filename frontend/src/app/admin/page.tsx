"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Train, 
  Signal, 
  Route as RouteIcon,
  Clock,
  AlertCircle,
  Activity
} from 'lucide-react';
import { metricsApi, liveLocationsApi, type SystemMetrics, type LiveLocation } from '@/lib/api';
import { supabase } from '@/lib/supabase-client';

interface Alert {
  id: number;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'error';
  timestamp: string;
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [trainStatuses, setTrainStatuses] = useState<LiveLocation[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await metricsApi.getSystemMetrics();
        setMetrics(data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching metrics:', err);
      }
    };

    const fetchTrainStatuses = async () => {
      try {
        const data = await liveLocationsApi.getAllLatest();
        setTrainStatuses(data);
      } catch (err: any) {
        console.error('Error fetching train statuses:', err);
        setError(`Failed to load train data: ${err.message || err}`);
      }
    };

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchMetrics(), fetchTrainStatuses()]);
      setLoading(false);
    };

    loadData();

    // Set up real-time subscription
    const channel = supabase
      .channel('live_locations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_locations',
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          
          if (payload.new) {
             const newLocation = payload.new as LiveLocation;
             const arrivalTime = new Date().getTime();
             const payloadTime = new Date(newLocation.timestamp).getTime();
             const diff = arrivalTime - payloadTime;
             console.log(`[Frontend] Update for ${newLocation.train_number}. Arrival: ${arrivalTime}, Payload: ${payloadTime}, Diff: ${diff}ms`);

             setTrainStatuses(prev => {
                const index = prev.findIndex(t => t.train_number === newLocation.train_number);
                if (index >= 0) {
                    const updated = [...prev];
                    updated[index] = newLocation;
                    return updated;
                } else {
                    return [...prev, newLocation];
                }
             });
          }
        }
      )
      .subscribe();

    // Set up periodic refresh as fallback
    const interval = setInterval(() => {
      fetchMetrics();
      fetchTrainStatuses();
    }, 30000); // Refresh every 30 seconds

    return () => {
      supabase.removeChannel(channel);
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
    <div className="flex-1 p-6 min-h-screen relative overflow-hidden">
      {/* Background Gradient matching Landing Page */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background z-0 pointer-events-none" />

      <div className="relative z-10 space-y-8 animate-fade-in-up">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
              System <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">Dashboard</span>
            </h1>
            <p className="text-gray-400 mt-2">Real-time overview of network operations</p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-primary font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Live Monitoring
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-200 flex items-center animate-pulse">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass-card h-32 animate-pulse bg-white/5" />
            ))}
          </div>
        ) : (
          <>
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Active Trains Card */}
              <div className="glass-card p-6 flex items-center space-x-4 group hover:-translate-y-1 transition-transform duration-300">
                <div className="p-3 rounded-xl bg-white/5 group-hover:bg-primary/20 transition-colors text-cyan-400">
                  <Train className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Active Trains</p>
                  <p className="text-3xl font-bold text-white">{metrics?.activeTrains || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Currently running</p>
                </div>
              </div>

              {/* Avg. Signal Card */}
              <div className="glass-card p-6 flex items-center space-x-4 group hover:-translate-y-1 transition-transform duration-300">
                <div className="p-3 rounded-xl bg-white/5 group-hover:bg-primary/20 transition-colors text-violet-400">
                  <Signal className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Avg. Signal</p>
                  <p className="text-3xl font-bold text-white">
                    {metrics?.avgSignal ? `${metrics.avgSignal.toFixed(0)} dBm` : '0 dBm'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Network strength</p>
                </div>
              </div>

              {/* Active Routes Card */}
              <div className="glass-card p-6 flex items-center space-x-4 group hover:-translate-y-1 transition-transform duration-300">
                <div className="p-3 rounded-xl bg-white/5 group-hover:bg-primary/20 transition-colors text-emerald-400">
                  <RouteIcon className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Active Routes</p>
                  <p className="text-3xl font-bold text-white">{metrics?.activeRoutes || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Scheduled paths</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Live Train Status */}
              <div className="lg:col-span-2 glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">Live Train Status</h2>
                    <p className="text-gray-400 text-sm">Real-time tracking information</p>
                  </div>
                  <Activity className="h-5 w-5 text-primary animate-pulse" />
                </div>
                
                {trainStatuses.length > 0 ? (
                  <div className="space-y-4">
                    {trainStatuses.map((status) => (
                      <div key={status.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/30 transition-colors">
                        <div className="flex items-center">
                          <div className="bg-primary/20 p-2 rounded-lg mr-4 text-primary">
                            <Train className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-white">{status.train_number}</h3>
                            <p className="text-sm text-gray-400 font-mono">
                              {Number(status.latitude).toFixed(4)}, {Number(status.longitude).toFixed(4)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="inline-flex items-center px-2 py-1 rounded bg-white/5 text-xs font-medium text-cyan-400 mb-1">
                            {status.speed} km/h
                          </div>
                          <p className="text-xs text-gray-500 flex items-center justify-end">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTimeAgo(status.timestamp)}
                          </p>
                          <p className="text-[10px] text-gray-600 font-mono mt-1">
                            Latency: {Math.max(0, new Date().getTime() - new Date(status.timestamp).getTime())}ms
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                    <Train className="h-12 w-12 opacity-20 mb-2" />
                    <p>No active trains detected</p>
                  </div>
                )}
              </div>

              {/* System Alerts */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">System Alerts</h2>
                    <p className="text-gray-400 text-sm">Recent notifications</p>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                </div>

                {alerts.length > 0 ? (
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <div key={alert.id} className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-start">
                          <AlertCircle className={`h-4 w-4 mr-3 mt-0.5 flex-shrink-0 ${
                            alert.severity === 'error' ? 'text-red-400' : 
                            alert.severity === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                          }`} />
                          <div>
                            <h4 className="font-medium text-sm text-white">{alert.title}</h4>
                            <p className="text-xs text-gray-400 mt-1 leading-relaxed">{alert.description}</p>
                            <p className="text-[10px] text-gray-600 mt-2 uppercase tracking-wider">{formatTimeAgo(alert.timestamp)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                    <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mb-2">
                      <AlertCircle className="h-6 w-6 opacity-50" />
                    </div>
                    <p>No active alerts</p>
                    <p className="text-xs text-gray-600 mt-1">System operating normally</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}