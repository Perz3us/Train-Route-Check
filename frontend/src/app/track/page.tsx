
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function TrackPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Track Trains</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Live Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gray-200 rounded-md">
                <Map center={[20.5937, 78.9629]} />
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Active Trains</CardTitle>
            </CardHeader>
            <CardContent>
              {/* List of active trains will go here */}
              <ul>
                <li>Train 1</li>
                <li>Train 2</li>
                <li>Train 3</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
