import { useState, useEffect } from 'react';
import { LiveLocation } from '@/lib/supabase';
import { TrainStatus } from '@/components/TrainStatusCard';
import { Alert } from '@/components/AlertCard';

export function useRealtimeDashboard() {
  const [trainStatuses, setTrainStatuses] = useState<TrainStatus[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const fetchInitialStatuses = async () => {
      try {
        // Fetch all latest locations from the backend
        const response = await fetch('/api/live-locations/latest');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch train statuses: ${response.status}`);
        }
        
        const result = await response.json();
        const data = result.data || [];
        
        const statuses: TrainStatus[] = data.map((loc: LiveLocation) => ({
          trainNumber: loc.train_number,
          lastUpdate: loc.timestamp,
          location: loc,
        }));
        
        setTrainStatuses(statuses);
      } catch (error) {
        console.error('Error fetching initial train statuses:', error);
      }
    };

    fetchInitialStatuses();

    // Set up polling for real-time updates (since we're not using Supabase realtime)
    const interval = setInterval(fetchInitialStatuses, 5000); // Poll every 5 seconds

    // For alerts, we'll need to implement a different approach
    // For now, we'll just set up a simple polling mechanism
    // In a real implementation, you might want to use WebSockets or Server-Sent Events
    const alertInterval = setInterval(async () => {
      try {
        // Fetch alerts from the backend
        // This is a placeholder - you'll need to implement the actual alert system
        // For now, we'll just add a dummy alert occasionally for demonstration
        if (Math.random() < 0.1) { // 10% chance of a new alert
          const newAlert: Alert = {
            id: Date.now().toString(),
            title: 'System Alert',
            description: 'New system notification',
            severity: 'info',
            timestamp: new Date().toISOString(),
          };
          setAlerts((prev) => [newAlert, ...prev.slice(0, 9)]);
        }
      } catch (error) {
        console.error('Error fetching alerts:', error);
      }
    }, 10000); // Poll for alerts every 10 seconds

    return () => {
      clearInterval(interval);
      clearInterval(alertInterval);
    };
  }, []);

  return { trainStatuses, alerts };
}
