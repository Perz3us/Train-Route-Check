
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRoutes } from "@/hooks/useRoutes";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditRoutePage({ params }: { params: { id: string } }) {
  const { routes, updateRoute } = useRoutes();
  const router = useRouter();
  const [route, setRoute] = useState<any>(null);

  useEffect(() => {
    const routeData = routes.find((r) => r.id === params.id);
    if (routeData) {
      setRoute(routeData);
    }
  }, [routes, params.id]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const train_number = formData.get("train_number") as string;
    await updateRoute(params.id, { name, train_number });
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
            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
