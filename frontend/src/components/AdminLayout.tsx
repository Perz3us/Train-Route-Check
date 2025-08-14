"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isAdmin, signOut } = useAuth();
  const router = useRouter();

  console.log("AdminLayout: rendering with state:", { loading, user, isAdmin });

  useEffect(() => {
    console.log("AdminLayout: useEffect triggered with state:", {
      loading,
      user,
      isAdmin,
    });
    if (!loading && !user) {
      console.log("AdminLayout: redirecting to /login");
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    // This should be handled by the useEffect, but as a fallback
    router.push("/login");
    return null;
  }

  return (
    <div className='flex min-h-screen w-full flex-col bg-muted/40'>
      <main className='flex flex-1 flex-col gap-4  md:gap-8 '>{children}</main>
    </div>
  );
}
