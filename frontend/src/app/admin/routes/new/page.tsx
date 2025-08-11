
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRoutes } from "@/hooks/useRoutes";
import { useRouter } from "next/navigation";

export default function NewRoutePage() {
  const { createRoute } = useRoutes();
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const train_number = formData.get("train_number") as string;
    await createRoute({ name, train_number });
    router.push("/admin/routes");
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Create Route</h1>
      <Card>
        <CardHeader>
          <CardTitle>Route Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="Enter route name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="train_number">Train Number</Label>
              <Input id="train_number" name="train_number" placeholder="Enter train number" />
            </div>
            <Button type="submit">Create Route</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
