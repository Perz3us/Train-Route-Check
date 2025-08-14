// services/api.ts
import Cookies from "js-cookie";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export interface Route {
  id: string;
  trainNumber: string;
  name: string;
  isActive: boolean;
  startTime: string | null;
  endTime: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  routeStations?: RouteStation[];
}

export interface RouteStation {
  id: string;
  routeId: string;
  stationId: string;
  sequence: number;
  distanceFromStart: number;
  estimatedDuration?: number;
  stopDuration: number;
  station: {
    id: string;
    name: string;
    code: string;
    latitude: number;
    longitude: number;
    city: string;
    state: string;
  };
}

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

export interface LiveLocation {
  id: string;
  train_number: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  accuracy: number;
  device_id: string | null;
  battery_level: number | null;
  signal_strength: number | null;
  timestamp: string;
  created_at: string;
  updated_at: string;
}

export interface SystemMetrics {
  activeTrains: number;
  totalRoutes: number;
  activeRoutes: number;
  totalStations: number;
  avgBattery: number;
  avgSignal: number;
  totalLocationPoints: number;
}

export interface TrainStatus {
  trainNumber: string;
  lastUpdate: string;
  location: {
    latitude: number;
    longitude: number;
    speed: number;
    signal_strength: number | null;
  };
}

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return Cookies.get("authToken") || null;
  }
  return null;
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      `API Error: ${response.status} - ${response.statusText}`,
      errorText
    );
    throw new Error(`API Error: ${response.status} - ${response.statusText}`);
  }
  return response.json();
};

// Helper function to get default headers with auth
const getDefaultHeaders = () => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

// Routes API
// Helper function to extract time from datetime string (HH:MM format)
const extractTime = (datetimeString: string | null): string => {
  if (!datetimeString) return "";
  try {
    // If it's already in HH:MM format, return as is
    if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(datetimeString)) {
      return datetimeString;
    }
    // Otherwise, extract time from full datetime string
    const date = new Date(datetimeString);
    return date.toTimeString().slice(0, 5); // Extract HH:MM
  } catch (e) {
    return "";
  }
};

export const routesApi = {
  getAll: async (): Promise<Route[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/routes`, {
        headers: getDefaultHeaders(),
      });
      const result = await handleResponse(response);
      // Handle paginated response from backend
      const routes = result.data || result;

      // Process routes to extract time values
      if (Array.isArray(routes)) {
        return routes.map((route) => ({
          ...route,
          startTime: route.startTime ? extractTime(route.startTime) : null,
          endTime: route.endTime ? extractTime(route.endTime) : null,
        }));
      }

      return routes;
    } catch (error) {
      console.error("Failed to fetch routes:", error);
      throw error;
    }
  },

  getById: async (id: string): Promise<Route> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/routes/${id}`, {
        headers: getDefaultHeaders(),
      });
      const route = await handleResponse(response);

      // Process route to extract time values
      return {
        ...route,
        startTime: route.startTime ? extractTime(route.startTime) : null,
        endTime: route.endTime ? extractTime(route.endTime) : null,
      };
    } catch (error) {
      console.error(`Failed to fetch route ${id}:`, error);
      throw error;
    }
  },

  create: async (
    route: Omit<Route, "id" | "createdBy" | "createdAt" | "updatedAt">
  ): Promise<Route> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/routes`, {
        method: "POST",
        headers: getDefaultHeaders(),
        body: JSON.stringify(route),
      });
      const newRoute = await handleResponse(response);

      // Process route to extract time values
      return {
        ...newRoute,
        startTime: newRoute.startTime ? extractTime(newRoute.startTime) : null,
        endTime: newRoute.endTime ? extractTime(newRoute.endTime) : null,
      };
    } catch (error) {
      console.error("Failed to create route:", error);
      throw error;
    }
  },

  update: async (
    id: string,
    route: Partial<Omit<Route, "id" | "createdBy" | "createdAt" | "updatedAt">>
  ): Promise<Route> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/routes/${id}`, {
        method: "PATCH",
        headers: getDefaultHeaders(),
        body: JSON.stringify(route),
      });
      const updatedRoute = await handleResponse(response);

      // Process route to extract time values
      return {
        ...updatedRoute,
        startTime: updatedRoute.startTime
          ? extractTime(updatedRoute.startTime)
          : null,
        endTime: updatedRoute.endTime
          ? extractTime(updatedRoute.endTime)
          : null,
      };
    } catch (error) {
      console.error(`Failed to update route ${id}:`, error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/routes/${id}`, {
        method: "DELETE",
        headers: getDefaultHeaders(),
      });
      if (!response.ok) {
        throw new Error(`Failed to delete route: ${response.status}`);
      }
    } catch (error) {
      console.error(`Failed to delete route ${id}:`, error);
      throw error;
    }
  },
};

// Stations API
export const stationsApi = {
  getAll: async (): Promise<Station[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stations`, {
        headers: getDefaultHeaders(),
      });
      const result = await handleResponse(response);
      return result.data || result;
    } catch (error) {
      console.error("Failed to fetch stations:", error);
      throw error;
    }
  },

  getById: async (id: string): Promise<Station> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stations/${id}`, {
        headers: getDefaultHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error(`Failed to fetch station ${id}:`, error);
      throw error;
    }
  },

  create: async (
    station: Omit<Station, "id" | "created_at" | "updated_at">
  ): Promise<Station> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stations`, {
        method: "POST",
        headers: getDefaultHeaders(),
        body: JSON.stringify(station),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("Failed to create station:", error);
      throw error;
    }
  },

  update: async (
    id: string,
    station: Partial<Omit<Station, "id" | "created_at" | "updated_at">>
  ): Promise<Station> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stations/${id}`, {
        method: "PATCH",
        headers: getDefaultHeaders(),
        body: JSON.stringify(station),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error(`Failed to update station ${id}:`, error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stations/${id}`, {
        method: "DELETE",
        headers: getDefaultHeaders(),
      });
      if (!response.ok) {
        throw new Error(`Failed to delete station: ${response.status}`);
      }
    } catch (error) {
      console.error(`Failed to delete station ${id}:`, error);
      throw error;
    }
  },
};

// Metrics API
export const metricsApi = {
  getSystemMetrics: async (): Promise<SystemMetrics> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/metrics`, {
        headers: getDefaultHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("Failed to fetch system metrics:", error);
      throw error;
    }
  },
};

// Live Locations API
export const liveLocationsApi = {
  getLatestByTrain: async (
    trainNumber: string
  ): Promise<LiveLocation | null> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/live-locations/train/${trainNumber}/latest`,
        {
          headers: getDefaultHeaders(),
        }
      );
      if (!response.ok) {
        if (response.status === 404) {
          return null; // No location found
        }
        throw new Error(`Failed to fetch latest location: ${response.status}`);
      }
      const result = await response.json();
      return result.data || null;
    } catch (error) {
      console.error(
        `Failed to fetch latest location for train ${trainNumber}:`,
        error
      );
      throw error;
    }
  },

  getByTrain: async (
    trainNumber: string,
    limit: number = 10
  ): Promise<LiveLocation[]> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/live-locations/train/${trainNumber}?limit=${limit}`,
        {
          headers: getDefaultHeaders(),
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch locations: ${response.status}`);
      }
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error(
        `Failed to fetch locations for train ${trainNumber}:`,
        error
      );
      throw error;
    }
  },
};
