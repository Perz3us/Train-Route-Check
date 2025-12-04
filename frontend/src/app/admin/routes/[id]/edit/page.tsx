
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRoutes } from "@/hooks/useRoutes";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Helper function to extract time from datetime string (HH:MM format)
const extractTime = (datetimeString: string | null): string => {
  if (!datetimeString) return '';
  try {
    // If it's already in HH:MM format, return as is
    if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(datetimeString)) {
      return datetimeString;
    }
    // Otherwise, extract time from full datetime string
    const date = new Date(datetimeString);
    return date.toTimeString().slice(0, 5); // Extract HH:MM
  } catch (e) {
    return '';
  }
};

export default function EditRoutePage({ params }: { params: { id: string } }) {
  const { routes, updateRoute } = useRoutes();
  const router = useRouter();
  const [route, setRoute] = useState<any>(null);

  useEffect(() => {
    const routeData = routes.find((r) => r.id === params.id);
    if (routeData) {
      // Create a copy with extracted time values for editing
      const routeForEditing = {
        ...routeData,
        startTime: extractTime(routeData.start_time),
        endTime: extractTime(routeData.end_time)
      };
      setRoute(routeForEditing);
    }
  }, [routes, params.id]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const trainNumber = formData.get("train_number") as string;
    const startTime = formData.get("start_time") as string;
    const endTime = formData.get("end_time") as string;
    
    await updateRoute(params.id, { 
      name, 
      train_number: trainNumber,
      start_time: startTime || null,
      end_time: endTime || null
    });
    router.push("/admin/routes");
  };

  if (!route) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Edit Route</h1>
      <Card>
        <CardHeader>
          <CardTitle>Route Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={route.name} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="train_number">Train Number</Label>
              <Input id="train_number" name="train_number" defaultValue={route.train_number} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="start_time">Start Time</Label>
              <Input 
                id="start_time" 
                name="start_time" 
                type="time"
                defaultValue={route.startTime || ''} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end_time">End Time</Label>
              <Input 
                id="end_time" 
                name="end_time" 
                type="time"
                defaultValue={route.endTime || ''} 
              />
            </div>
            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
