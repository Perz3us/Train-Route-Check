
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStations } from "@/hooks/useStations";
import { useRouter } from "next/navigation";

export default function NewStationPage() {
  const { createStation } = useStations();
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const code = formData.get("code") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    await createStation({ name, code, city, state });
    router.push("/admin/stations");
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Create Station</h1>
      <Card>
        <CardHeader>
          <CardTitle>Station Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="Enter station name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="code">Code</Label>
              <Input id="code" name="code" placeholder="Enter station code" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" placeholder="Enter city" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" name="state" placeholder="Enter state" />
            </div>
            <Button type="submit">Create Station</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
