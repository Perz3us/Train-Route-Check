"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Route } from '@/lib/supabase';

export function useRoutes() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoutes = async () => {
    const { data, error } = await supabase
      .from('routes')
      .select(
        `
        *,
        route_stations (
          id,
          sequence,
          distance_from_start,
          estimated_duration,
          stop_duration,
          stations (
            id,
            name,
            code,
            latitude,
            longitude,
            city,
            state
          )
        )
      `,
      )
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRoutes(data as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const createRoute = async (routeData: any) => {
    const { data, error } = await supabase
      .from('routes')
      .insert(routeData)
      .select()
      .single();

    if (!error) {
      await fetchRoutes(); // Refresh the list
    }

    return { data, error };
  };

  const updateRoute = async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('routes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (!error) {
      await fetchRoutes(); // Refresh the list
    }

    return { data, error };
  };

  const deleteRoute = async (id: string) => {
    const { error } = await supabase.from('routes').delete().eq('id', id);

    if (!error) {
      await fetchRoutes(); // Refresh the list
    }

    return { error };
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