import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface Alert {
  title: string;
  message: string;
  timestamp: string;
}

interface AlertCardProps {
  alert: Alert;
}

export function AlertCard({ alert }: AlertCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{alert.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{alert.message}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(alert.timestamp).toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}
