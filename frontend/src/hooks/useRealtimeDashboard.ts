import { useState, useEffect } from 'react';
import { supabase, LiveLocation } from '@/lib/supabase';
import { TrainStatus } from '@/components/TrainStatusCard';
import { Alert } from '@/components/AlertCard';

export function useRealtimeDashboard() {
  const [trainStatuses, setTrainStatuses] = useState<TrainStatus[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const fetchInitialStatuses = async () => {
      const { data, error } = await supabase
        .from('live_locations')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching initial train statuses:', error);
        return;
      }

      const latestStatuses: { [key: string]: LiveLocation } = {};
      for (const loc of data) {
        if (!latestStatuses[loc.train_number]) {
          latestStatuses[loc.train_number] = loc;
        }
      }

      const statuses: TrainStatus[] = Object.values(latestStatuses).map(
        (loc) => ({
          trainNumber: loc.train_number,
          lastUpdate: loc.timestamp,
          location: loc,
        })
      );

      setTrainStatuses(statuses);
    };

    fetchInitialStatuses();

    const locationSubscription = supabase
      .channel('all-locations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_locations',
        },
        (payload) => {
          const newLocation = payload.new as LiveLocation;
          setTrainStatuses((prev) => {
            const existingStatusIndex = prev.findIndex(
              (s) => s.trainNumber === newLocation.train_number
            );
            const newStatus = {
              trainNumber: newLocation.train_number,
              lastUpdate: newLocation.timestamp,
              location: newLocation,
            };
            if (existingStatusIndex > -1) {
              const newStatuses = [...prev];
              newStatuses[existingStatusIndex] = newStatus;
              return newStatuses;
            } else {
              return [...prev, newStatus];
            }
          });
        }
      )
      .subscribe();

    const alertSubscription = supabase
      .channel('system-alerts')
      .on('broadcast', { event: 'alert' }, (payload) => {
        setAlerts((prev) => [payload.payload, ...prev.slice(0, 9)]);
      })
      .subscribe();

    return () => {
      locationSubscription.unsubscribe();
      alertSubscription.unsubscribe();
    };
  }, []);

  return { trainStatuses, alerts };
}
