'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';
import { Train, ArrowRight, Clock } from 'lucide-react';

export default function TrackPage() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await fetch('/api/routes?isActive=true');
        if (response.ok) {
          const data = await response.json();
          setRoutes(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching routes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRoutes();
  }, []);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Active Trains</h1>
        <p className="text-muted-foreground mt-2">
          Select a train to view its live location and schedule.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : routes.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {routes.map((route) => (
            <Link key={route.id} href={`/track/${route.trainNumber}`}>
              <Card className="hover:bg-white/5 transition-colors cursor-pointer border-white/10 bg-white/5 backdrop-blur-sm h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xl font-bold">
                    {route.name}
                  </CardTitle>
                  <Train className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">{route.trainNumber}</div>
                  <div className="flex items-center text-sm text-muted-foreground mb-4">
                    <Clock className="mr-1 h-4 w-4" />
                    {route.startTime ? new Date(route.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Scheduled'}
                  </div>
                  <div className="flex items-center text-primary text-sm font-medium">
                    Track Live <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground bg-white/5 rounded-lg border border-white/10">
          <Train className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No active trains found</p>
          <p className="text-sm">Please check back later.</p>
        </div>
      )}
    </div>
  );
}
