'use client';



import { useTrainTracking } from "@/hooks/useTrainTracking";
import { useState, useEffect } from 'react';


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });


export default function TrainDetailsPage({ params }: { params: { train_number: string } }) {
  const { location, loading: trackingLoading, error: trackingError } = useTrainTracking(params.train_number);
  const [route, setRoute] = useState<any>(null);
  const [routeLoading, setRouteLoading] = useState(true);

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const response = await fetch(`/api/routes/train/${params.train_number}`);
        if (response.ok) {
          const data = await response.json();
          setRoute(data);
        }
      } catch (error) {
        console.error('Error fetching route:', error);
      } finally {
        setRouteLoading(false);
      }
    };
    fetchRoute();
  }, [params.train_number]);

  if (trackingLoading || routeLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (trackingError) {
    return <div className="text-red-500 p-4">Error: {trackingError}</div>;
  }

  const calculateETA = (startTime: string | null, durationMinutes: number) => {
    if (!startTime) return '--:--';
    try {
      const start = new Date(startTime);
      const eta = new Date(start.getTime() + durationMinutes * 60000);
      return eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '--:--';
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Train {params.train_number}</h1>
          <p className="text-muted-foreground">
            {route?.name || 'Unknown Route'} • {route?.isActive ? 'Active' : 'Inactive'}
          </p>
        </div>
        {location && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium">Live Signal</span>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Live Location</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[500px] w-full bg-gray-900/50 relative">
                {location ? (
                  <Map center={[location.latitude, location.longitude]} trainLocation={location} />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    Waiting for GPS signal...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-white/10 bg-white/5 backdrop-blur-sm h-full">
            <CardHeader>
              <CardTitle>Route Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {route?.routeStations && route.routeStations.length > 0 ? (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-white/10"></div>
                  
                  <div className="space-y-6">
                    {route.routeStations
                      .sort((a: any, b: any) => a.sequence - b.sequence)
                      .map((station: any, index: number) => (
                        <div key={station.id} className="relative flex items-start gap-4 pl-6">
                          {/* Timeline dot */}
                          <div className={`absolute left-0 top-1.5 h-5 w-5 rounded-full border-2 flex items-center justify-center bg-background z-10 ${
                            index === 0 ? 'border-green-500 text-green-500' : 
                            index === route.routeStations.length - 1 ? 'border-red-500 text-red-500' : 
                            'border-gray-600 text-gray-400'
                          }`}>
                            <div className={`h-2 w-2 rounded-full ${
                              index === 0 ? 'bg-green-500' : 
                              index === route.routeStations.length - 1 ? 'bg-red-500' : 
                              'bg-gray-600'
                            }`}></div>
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="font-medium text-white">{station.station.name}</h4>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-xs text-muted-foreground">
                                {index === 0 ? 'Start' : index === route.routeStations.length - 1 ? 'End' : `Stop: ${station.stopDuration}m`}
                              </span>
                              <span className="text-sm font-mono text-primary">
                                {calculateETA(route.startTime, station.estimatedDuration || 0)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No route information available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
