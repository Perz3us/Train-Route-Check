"use client";

import { useState, useEffect } from 'react';
import type { Route } from '@/lib/supabase';

export function useRoutes() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoutes = async () => {
    try {
      const response = await fetch('/api/routes');
      const result = await response.json();
      const data = result.data || result;
      
      if (response.ok) {
        setRoutes(data as any);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const createRoute = async (routeData: any) => {
    try {
      const response = await fetch('/api/routes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(routeData),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        await fetchRoutes(); // Refresh the list
        return { data: result, error: null };
      } else {
        return { data: null, error: new Error(result.message || 'Failed to create route') };
      }
    } catch (error: any) {
      return { data: null, error };
    }
  };

  const updateRoute = async (id: string, updates: any) => {
    try {
      const response = await fetch(`/api/routes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        await fetchRoutes(); // Refresh the list
        return { data: result, error: null };
      } else {
        return { data: null, error: new Error(result.message || 'Failed to update route') };
      }
    } catch (error: any) {
      return { data: null, error };
    }
  };

  const deleteRoute = async (id: string) => {
    try {
      const response = await fetch(`/api/routes/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchRoutes(); // Refresh the list
        return { error: null };
      } else {
        const result = await response.json();
        return { error: new Error(result.message || 'Failed to delete route') };
      }
    } catch (error: any) {
      return { error };
    }
  };

  return {
    routes,
    loading,
    createRoute,
    updateRoute,
    deleteRoute,
    refetch: fetchRoutes,
  };
}