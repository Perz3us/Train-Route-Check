'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';

export default function DashboardPage() {
  const { profile, isAdmin } = useAuth();
  const router = useRouter();

  // Redirect admin users to admin dashboard
  useEffect(() => {
    if (isAdmin) {
      router.push('/admin');
    }
  }, [isAdmin, router]);

  return (
    <ProtectedLayout>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {profile?.fullName || profile?.email}!</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You are logged in as a {profile?.role} user.</p>
            <p className="mt-2">This is the main dashboard for regular users.</p>
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  );
}