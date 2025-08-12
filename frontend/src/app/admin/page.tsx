"use client";

import { MetricCard } from "@/components/MetricCard";
import { useSystemMetrics } from "@/hooks/useSystemMetrics";
import { TrainStatusCard } from "@/components/TrainStatusCard";
import { AlertCard } from "@/components/AlertCard";
import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AdminDashboard() {
  const { metrics, loading: metricsLoading } = useSystemMetrics();
  const { trainStatuses, alerts } = useRealtimeDashboard();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricsLoading ? (
          <p>Loading metrics...</p>
        ) : (
          metrics && (
            <>
              <MetricCard
                title="Active Trains"
                value={metrics.activeTrains}
                icon={"🚂"}
              />
              <MetricCard
                title="Avg. Battery"
                value={`${metrics.avgBattery.toFixed(1)}%`}
                icon={"🔋"}
              />
              <MetricCard
                title="Avg. Signal"
                value={`${metrics.avgSignal.toFixed(0)} dBm`}
                icon={"📡"}
              />
              <MetricCard
                title="Active Routes"
                value={metrics.routesActive}
                icon={"🛤️"}
              />
            </>
          )
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Live Train Status</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {trainStatuses.length > 0 ? (
                trainStatuses.map((status) => (
                  <TrainStatusCard
                    key={status.trainNumber}
                    status={status}
                  />
                ))
              ) : (
                <p>No active trains.</p>
              )}
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {alerts.length > 0 ? (
                alerts.map((alert, index) => (
                  <AlertCard key={index} alert={alert} />
                ))
              ) : (
                <p>No system alerts.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
