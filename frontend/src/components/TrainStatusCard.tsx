import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  Gauge, 
  Battery, 
  Wifi, 
  Clock
} from 'lucide-react';
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
  const isOnline = new Date().getTime() - new Date(status.lastUpdate).getTime() < 300000; // 5 minutes
  const lastUpdate = new Date(status.lastUpdate);
  const now = new Date();
  const minutesAgo = Math.floor((now.getTime() - lastUpdate.getTime()) / 60000);
  
  return (
    <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center">
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded mr-2">
              {status.trainNumber}
            </span>
          </CardTitle>
          <Badge variant={isOnline ? "success" : "secondary"}>
            {isOnline ? "ONLINE" : "OFFLINE"}
          </Badge>
        </div>
        <CardDescription className="flex items-center text-xs">
          <Clock className="mr-1 h-3 w-3" />
          {minutesAgo < 1 ? "Just now" : `${minutesAgo} min ago`}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="flex items-center text-sm">
          <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {status.location.latitude.toFixed(4)}, {status.location.longitude.toFixed(4)}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="space-y-1">
            <div className="flex items-center text-xs text-muted-foreground">
              <Gauge className="mr-1 h-3 w-3" />
              Speed
            </div>
            <p className="font-semibold">{status.location.speed} km/h</p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center text-xs text-muted-foreground">
              <Battery className="mr-1 h-3 w-3" />
              Battery
            </div>
            <div className="flex items-center">
              <Progress 
                value={status.location.battery_level || 0} 
                className="w-16 mr-2" 
              />
              <span className="text-xs font-medium">
                {status.location.battery_level || 0}%
              </span>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center text-xs text-muted-foreground">
              <Wifi className="mr-1 h-3 w-3" />
              Signal
            </div>
            <p className="font-semibold">
              {status.location.signal_strength 
                ? `${status.location.signal_strength} dBm` 
                : 'N/A'}
            </p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center text-xs text-muted-foreground">
              <MapPin className="mr-1 h-3 w-3" />
              Heading
            </div>
            <p className="font-semibold">
              {status.location.heading ? `${status.location.heading.toFixed(1)}°` : 'N/A'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}