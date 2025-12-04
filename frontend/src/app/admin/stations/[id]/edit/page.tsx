
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStations } from "@/hooks/useStations";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditStationPage({ params }: { params: { id: string } }) {
  const { stations, updateStation } = useStations();
  const router = useRouter();
  const [station, setStation] = useState<any>(null);

  useEffect(() => {
    const stationData = stations.find((s) => s.id === params.id);
    if (stationData) {
      setStation(stationData);
    }
  }, [stations, params.id]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const code = formData.get("code") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    await updateStation(params.id, { name, code, city, state });
    router.push("/admin/stations");
  };

  if (!station) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Edit Station</h1>
      <Card>
        <CardHeader>
          <CardTitle>Station Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={station.name} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="code">Code</Label>
              <Input id="code" name="code" defaultValue={station.code} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" defaultValue={station.city} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" name="state" defaultValue={station.state} />
            </div>
            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
