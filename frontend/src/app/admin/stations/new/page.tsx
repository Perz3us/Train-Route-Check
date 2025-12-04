
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStations } from "@/hooks/useStations";
import { useRouter } from "next/navigation";

export default function NewStationPage() {
  const { createStation } = useStations();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    city: "",
    province: "",
    latitude: "",
    longitude: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Form Data State:", formData);

    const payload = {
      name: formData.name,
      code: formData.code,
      city: formData.city,
      province: formData.province,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
    };

    console.log("Submitting payload:", payload);
    await createStation(payload);
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
              <Input 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Enter station name" 
                required 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="code">Code</Label>
              <Input 
                id="code" 
                name="code" 
                value={formData.code} 
                onChange={handleChange} 
                placeholder="Enter station code" 
                required 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="city">City</Label>
              <Input 
                id="city" 
                name="city" 
                value={formData.city} 
                onChange={handleChange} 
                placeholder="Enter city" 
                required 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="province">Province</Label>
              <Input 
                id="province" 
                name="province" 
                value={formData.province} 
                onChange={handleChange} 
                placeholder="Enter province" 
                required 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input 
                  id="latitude" 
                  name="latitude" 
                  type="number" 
                  step="any" 
                  value={formData.latitude} 
                  onChange={handleChange} 
                  placeholder="e.g. 6.9333" 
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input 
                  id="longitude" 
                  name="longitude" 
                  type="number" 
                  step="any" 
                  value={formData.longitude} 
                  onChange={handleChange} 
                  placeholder="e.g. 79.8500" 
                  required 
                />
              </div>
            </div>
            <Button type="submit">Create Station</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
