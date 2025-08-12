import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LiveLocation } from '@/lib/supabase';

export interface TrainStatus {
  trainNumber: string;
  lastUpdate: string;
  location: LiveLocation;
}

interface TrainStatusCardProps {
  status: TrainStatus;
}

export function TrainStatusCard({ status }: TrainStatusCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Train {status.trainNumber}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Last update: {new Date(status.lastUpdate).toLocaleTimeString()}</p>
        <p>
          Location: {status.location.latitude.toFixed(4)},{' '}
          {status.location.longitude.toFixed(4)}
        </p>
        <p>Speed: {status.location.speed} km/h</p>
      </CardContent>
    </Card>
  );
}
