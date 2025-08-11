"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Station {
    id: string;
    name: string;
    code: string;
    latitude: number;
    longitude: number;
    city: string;
    state: string;
    created_at: string;
    updated_at: string;
}

export function useStations() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStations = async () => {
    const { data, error } = await supabase
      .from('stations')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setStations(data as Station[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStations();
  }, []);

  const createStation = async (stationData: any) => {
    const { data, error } = await supabase
      .from('stations')
      .insert(stationData)
      .select()
      .single();

    if (!error) {
      await fetchStations(); // Refresh the list
    }

    return { data, error };
  };

  const updateStation = async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('stations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (!error) {
      await fetchStations(); // Refresh the list
    }

    return { data, error };
  };

  const deleteStation = async (id: string) => {
    const { error } = await supabase.from('stations').delete().eq('id', id);

    if (!error) {
      await fetchStations(); // Refresh the list
    }

    return { error };
  };

  return {
    stations,
    loading,
    createStation,
    updateStation,
    deleteStation,
    refetch: fetchStations,
  };
}