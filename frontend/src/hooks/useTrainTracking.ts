
"use client";

import { useEffect, useState } from 'react';
import type { LiveLocation } from '@/lib/supabase';

export function useTrainTracking(trainNumber: string) {
  const [location, setLocation] = useState<LiveLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/live-locations/train/${trainNumber}/latest`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setLocation(null);
            return;
          }
          throw new Error(`Failed to fetch location: ${response.status}`);
        }
        
        const result = await response.json();
        const data = result.data || null;
        
        setLocation(data);
      } catch (err: any) {
        console.error('Error fetching location:', err);
        setError('Failed to fetch train location');
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();

    // Set up polling for real-time updates (since we're not using Supabase realtime)
    const interval = setInterval(fetchLocation, 5000); // Poll every 5 seconds

    return () => {
      clearInterval(interval);
    };
  }, [trainNumber]);

  return { location, loading, error };
}
