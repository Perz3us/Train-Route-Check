
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { useStations } from "@/hooks/useStations";


export default function StationsPage() {
  const { stations, loading } = useStations();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Stations</h1>
        <Link href="/admin/stations/new">
          <Button>Create Station</Button>
        </Link>
      </div>
      <Card>
        <CardContent>
          <Table className="min-w-full divide-y divide-gray-200">
            <TableCaption>A list of your train stations.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white divide-y divide-gray-200">
              {stations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">No stations found.</TableCell>
                </TableRow>
              ) : (
                stations.map((station) => (
                  <TableRow key={station.id}>
                    <TableCell className="px-6 py-4 whitespace-nowrap">{station.name}</TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">{station.code}</TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">{station.city}</TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">{station.state}</TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/admin/stations/${station.id}/edit`}>
                        <Button variant="outline" size="sm">Edit</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
