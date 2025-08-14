import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

export interface Alert {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'error' | 'warning' | 'info' | 'success';
}

interface AlertCardProps {
  alert: Alert;
}

export function AlertCard({ alert }: AlertCardProps) {
  const getAlertIcon = () => {
    switch (alert.type) {
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getBadgeVariant = () => {
    switch (alert.type) {
      case 'error': return 'destructive';
      case 'warning': return 'warning';
      case 'success': return 'success';
      default: return 'secondary';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-md font-semibold flex items-center">
            {getAlertIcon()}
            <span className="ml-2">{alert.title}</span>
          </CardTitle>
          <Badge variant={getBadgeVariant()}>
            {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-2">{alert.message}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(alert.timestamp).toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}