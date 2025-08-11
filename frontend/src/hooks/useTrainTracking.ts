
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { LiveLocation } from '@/lib/supabase';

export function useTrainTracking(trainNumber: string) {
  const [location, setLocation] = useState<LiveLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch initial location
    const fetchInitialLocation = async () => {
      const { data, error } = await supabase
        .from('live_locations')
        .select('*')
        .eq('train_number', trainNumber)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        // No rows returned
        setError(error.message);
      } else {
        setLocation(data);
      }
      setLoading(false);
    };

    fetchInitialLocation();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`train-${trainNumber}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_locations',
          filter: `train_number=eq.${trainNumber}`,
        },
        (payload) => {
          if (
            payload.eventType === 'INSERT' ||
            payload.eventType === 'UPDATE'
          ) {
            setLocation(payload.new as LiveLocation);
          }
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [trainNumber]);

  return { location, loading, error };
}
