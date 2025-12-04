"use client";

import { useState, useEffect } from 'react';

export interface Station {
    id: string;
    name: string;
    code: string;
    latitude: number;
    longitude: number;
    city: string;
    province: string;
    created_at: string;
    updated_at: string;
}

export function useStations() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStations = async () => {
    try {
      const response = await fetch('/api/stations');
      const result = await response.json();
      const data = result.data || result;
      
      if (response.ok) {
        setStations(data as Station[]);
      }
    } catch (error) {
      console.error('Error fetching stations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  const createStation = async (stationData: any) => {
    try {
      const response = await fetch('/api/stations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stationData),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        await fetchStations(); // Refresh the list
        return { data: result, error: null };
      } else {
        return { data: null, error: new Error(result.message || 'Failed to create station') };
      }
    } catch (error: any) {
      return { data: null, error };
    }
  };

  const updateStation = async (id: string, updates: any) => {
    try {
      const response = await fetch(`/api/stations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        await fetchStations(); // Refresh the list
        return { data: result, error: null };
      } else {
        return { data: null, error: new Error(result.message || 'Failed to update station') };
      }
    } catch (error: any) {
      return { data: null, error };
    }
  };

  const deleteStation = async (id: string) => {
    try {
      const response = await fetch(`/api/stations/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchStations(); // Refresh the list
        return { error: null };
      } else {
        const result = await response.json();
        return { error: new Error(result.message || 'Failed to delete station') };
      }
    } catch (error: any) {
      return { error };
    }
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