

import { useTrainTracking } from "@/hooks/useTrainTracking";


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });


export default function TrainDetailsPage({ params }: { params: { train_number: string } }) {
  const { location, loading, error } = useTrainTracking(params.train_number);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Train {params.train_number}</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Live Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gray-200 rounded-md">
                {location && (
                  <Map center={[location.latitude, location.longitude]} trainLocation={location} />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Route</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Station</TableHead>
                    <TableHead>ETA</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { id: '1', name: 'Station A', eta: '10:30 AM' },
                    { id: '2', name: 'Station B', eta: '11:15 AM' },
                    { id: '3', name: 'Station C', eta: '12:00 PM' }
                  ].map((station) => (
                    <TableRow key={station.id}>
                      <TableCell>{station.name}</TableCell>
                      <TableCell>{station.eta}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
