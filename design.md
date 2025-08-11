# Train Route Schedule Checker - System Design Document (Updated with Supabase)

## 1. Project Overview

### 1.1 Project Description

A real-time train tracking and route management system that allows administrators to manage train routes and enables public users to track train locations and get estimated arrival times.

### 1.2 Key Features

- **Admin Portal**: Route management, station addition, distance configuration
- **IoT Integration**: Real-time location tracking from train devices
- **Public Interface**: Live train tracking and ETA calculations
- **Real-time Updates**: Supabase Realtime for live location streaming

### 1.3 Target Users

- **System Administrators**: Railway operators managing routes
- **General Public**: Passengers tracking train locations
- **IoT Devices**: GPS-enabled devices on trains

## 2. System Architecture

### 2.1 Technology Stack

#### Backend

- **Database & Backend**: Supabase (PostgreSQL + Real-time + Auth + API)
- **Additional Backend**: NestJS with TypeScript (for complex business logic)
- **Authentication**: Supabase Auth with Row Level Security (RLS)
- **Real-time**: Supabase Realtime (WebSocket-based)
- **API**: Supabase Auto-generated REST API + Custom NestJS endpoints
- **File Storage**: Supabase Storage

#### Frontend

- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Supabase Client**: @supabase/supabase-js
- **Maps**: Leaflet or Google Maps API
- **Real-time**: Supabase Realtime subscriptions

#### Infrastructure

- **Development**: Docker containers (optional for local NestJS)
- **Database**: Supabase PostgreSQL (Cloud-hosted)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **File Storage**: Supabase Storage
- **Hosting**: Vercel (Frontend) + Railway/Render (NestJS if needed)

### 2.2 Updated System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                     │
├─────────────────┬─────────────────┬─────────────────────────┤
│   Admin Panel   │  Public Portal  │    Real-time Updates    │
│   - Login       │  - Track Trains │    - Supabase Client    │
│   - Route CRUD  │  - View ETAs    │    - Realtime Subs      │
│   - Dashboard   │  - Station Info │    - Live Location      │
└─────────────────┴─────────────────┴─────────────────────────┘
                           │
                    Supabase Client SDK
                           │
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Platform                       │
├─────────────────┬─────────────────┬─────────────────────────┤
│  Supabase Auth  │ Auto-gen APIs   │   Supabase Realtime     │
│  - JWT Auth     │ - REST APIs     │   - WebSocket Gateway   │
│  - RLS Policies │ - GraphQL       │   - Live Subscriptions  │
│  - User Mgmt    │ - Validation    │   - Broadcast/Presence  │
└─────────────────┴─────────────────┴─────────────────────────┘
                           │
                    Direct DB Connection
                           │
┌─────────────────────────────────────────────────────────────┐
│              Supabase PostgreSQL Database                  │
├─────────────────┬─────────────────┬─────────────────────────┤
│     Users       │     Routes      │     Locations           │
│   - Auth Users  │   - Stations    │   - Live Data           │
│   - Profiles    │   - Distances   │   - Historical          │
│   - RLS Rules   │   - RLS Rules   │   - RLS Rules           │
└─────────────────┴─────────────────┴─────────────────────────┘
                           │
                    HTTP/WebSocket (Optional)
                           │
┌─────────────────────────────────────────────────────────────┐
│            Custom NestJS Service (Optional)                │
├─────────────────┬─────────────────┬─────────────────────────┤
│   ETA Engine    │  Complex Logic  │   IoT Data Processor    │
│   - Algorithms  │  - Validations  │   - Data Transformation │
│   - ML Models   │  - Workflows    │   - Batch Processing    │
│   - Caching     │  - Scheduling   │   - Error Handling      │
└─────────────────┴─────────────────┴─────────────────────────┘
                           │
                    IoT Data Stream
                           │
┌─────────────────────────────────────────────────────────────┐
│                IoT Simulation Layer                         │
├─────────────────┬─────────────────┬─────────────────────────┤
│  GPS Simulator  │  Fleet Manager  │   Data Generator        │
│  - Location     │  - Multi-train  │   - Realistic Movement  │
│  - Speed        │  - Scheduling   │   - Weather Effects     │
│  - Status       │  - Monitoring   │   - Station Stops       │
└─────────────────┴─────────────────┴─────────────────────────┘
```

## 3. Supabase Database Design

### 3.1 Authentication Setup

Supabase handles user authentication automatically. We'll extend it with profiles:

```sql
-- Enable RLS on all tables
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- User profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    full_name VARCHAR(255),
    avatar_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);
```

### 3.2 Updated Database Schema with RLS

#### Routes Table

```sql
CREATE TABLE public.routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    train_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    start_time TIME,
    end_time TIME,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Routes are viewable by everyone" ON routes
    FOR SELECT USING (true);

CREATE POLICY "Only admins can insert routes" ON routes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Only admins can update routes" ON routes
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Only admins can delete routes" ON routes
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );
```

#### Stations Table

```sql
CREATE TABLE public.stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Stations are viewable by everyone" ON stations
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify stations" ON stations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );
```

#### Route_Stations Junction Table

```sql
CREATE TABLE public.route_stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
    station_id UUID REFERENCES stations(id),
    sequence INTEGER NOT NULL,
    distance_from_start DECIMAL(8, 2) NOT NULL,
    estimated_duration INTEGER, -- minutes from start
    stop_duration INTEGER DEFAULT 2, -- minutes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(route_id, sequence)
);

-- Enable RLS
ALTER TABLE public.route_stations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Route stations are viewable by everyone" ON route_stations
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify route stations" ON route_stations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );
```

#### Live_Locations Table (Real-time enabled)

```sql
CREATE TABLE public.live_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    train_number VARCHAR(50) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    speed DECIMAL(5, 2) DEFAULT 0,
    heading DECIMAL(5, 2) DEFAULT 0,
    accuracy DECIMAL(5, 2) DEFAULT 0,
    device_id VARCHAR(100),
    battery_level INTEGER,
    signal_strength INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_live_locations_train ON live_locations(train_number);
CREATE INDEX idx_live_locations_timestamp ON live_locations(timestamp);

-- Enable RLS
ALTER TABLE public.live_locations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Live locations are viewable by everyone" ON live_locations
    FOR SELECT USING (true);

-- Allow IoT devices to insert (you might want to create a service role for this)
CREATE POLICY "IoT devices can insert location data" ON live_locations
    FOR INSERT WITH CHECK (true); -- This should be more restrictive in production

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE live_locations;
```

#### Location_History Table

```sql
CREATE TABLE public.location_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    train_number VARCHAR(50) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    speed DECIMAL(5, 2) DEFAULT 0,
    heading DECIMAL(5, 2) DEFAULT 0,
    device_id VARCHAR(100),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_location_history_train_timestamp ON location_history(train_number, timestamp);

-- Enable RLS
ALTER TABLE public.location_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Location history is viewable by everyone" ON location_history
    FOR SELECT USING (true);

CREATE POLICY "Only system can insert location history" ON location_history
    FOR INSERT WITH CHECK (true); -- Restrict this in production
```

### 3.3 Database Functions and Triggers

#### Auto-update timestamps

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_routes_updated_at
    BEFORE UPDATE ON routes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_live_locations_updated_at
    BEFORE UPDATE ON live_locations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

#### Archive old location data

```sql
-- Function to archive old location data
CREATE OR REPLACE FUNCTION archive_old_locations()
RETURNS void AS $$
BEGIN
    -- Move locations older than 24 hours to history
    INSERT INTO location_history (
        train_number, latitude, longitude, speed, heading, device_id, timestamp
    )
    SELECT
        train_number, latitude, longitude, speed, heading, device_id, timestamp
    FROM live_locations
    WHERE timestamp < NOW() - INTERVAL '24 hours';

    -- Delete old records from live_locations
    DELETE FROM live_locations
    WHERE timestamp < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;
```

## 4. Supabase Integration

### 4.1 Frontend Supabase Client Setup

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types based on database schema
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          role: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: string;
          full_name?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          email?: string;
          role?: string;
          full_name?: string | null;
          avatar_url?: string | null;
        };
      };
      routes: {
        Row: {
          id: string;
          train_number: string;
          name: string;
          is_active: boolean;
          start_time: string | null;
          end_time: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          train_number: string;
          name: string;
          is_active?: boolean;
          start_time?: string | null;
          end_time?: string | null;
          created_by?: string | null;
        };
        Update: {
          train_number?: string;
          name?: string;
          is_active?: boolean;
          start_time?: string | null;
          end_time?: string | null;
        };
      };
      live_locations: {
        Row: {
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
        };
        Insert: {
          train_number: string;
          latitude: number;
          longitude: number;
          speed?: number;
          heading?: number;
          accuracy?: number;
          device_id?: string | null;
          battery_level?: number | null;
          signal_strength?: number | null;
          timestamp: string;
        };
        Update: {
          latitude?: number;
          longitude?: number;
          speed?: number;
          heading?: number;
          accuracy?: number;
          battery_level?: number | null;
          signal_strength?: number | null;
        };
      };
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Route = Database['public']['Tables']['routes']['Row'];
export type LiveLocation =
  Database['public']['Tables']['live_locations']['Row'];
```

### 4.2 Authentication Hook

```typescript
// hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, Profile } from '@/lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setProfile(data);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    profile,
    loading,
    signIn,
    signOut,
    isAdmin: profile?.role === 'admin',
  };
}
```

### 4.3 Real-time Location Tracking

```typescript
// hooks/useTrainTracking.ts
import { useEffect, useState } from 'react';
import { supabase, LiveLocation } from '@/lib/supabase';

export function useTrainTracking(trainNumber: string) {
  const [location, setLocation] = useState<LiveLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch initial location
    const fetchInitialLocation = async () => {
      const { data, error } = await supabase
        .from('live_locations')
        .select('*')
        .eq('train_number', trainNumber)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        // No rows returned
        setError(error.message);
      } else {
        setLocation(data);
      }
      setLoading(false);
    };

    fetchInitialLocation();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`train-${trainNumber}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_locations',
          filter: `train_number=eq.${trainNumber}`,
        },
        (payload) => {
          if (
            payload.eventType === 'INSERT' ||
            payload.eventType === 'UPDATE'
          ) {
            setLocation(payload.new as LiveLocation);
          }
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [trainNumber]);

  return { location, loading, error };
}
```

### 4.4 Route Management with Supabase

```typescript
// hooks/useRoutes.ts
import { useState, useEffect } from 'react';
import { supabase, Route } from '@/lib/supabase';

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
      setRoutes(data);
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
```

## 5. Updated API Design

### 5.1 Supabase Auto-generated APIs

Most CRUD operations will use Supabase's auto-generated REST API:

```typescript
// Example API calls using Supabase client

// GET all routes
const { data: routes } = await supabase.from('routes').select('*');

// GET route with stations
const { data: route } = await supabase
  .from('routes')
  .select(
    `
    *,
    route_stations (
      *,
      stations (*)
    )
  `,
  )
  .eq('id', routeId)
  .single();

// CREATE new route
const { data: newRoute } = await supabase
  .from('routes')
  .insert({
    train_number: 'TRN_001',
    name: 'Express Train',
  })
  .select()
  .single();

// UPDATE route
const { data: updatedRoute } = await supabase
  .from('routes')
  .update({ name: 'Updated Express' })
  .eq('id', routeId)
  .select()
  .single();

// DELETE route
const { error } = await supabase.from('routes').delete().eq('id', routeId);
```

### 5.2 Custom NestJS APIs (Optional)

For complex business logic that can't be handled by Supabase alone:

#### POST /api/locations/update (IoT Endpoint)

```typescript
// Custom NestJS endpoint for IoT data processing
@Post('locations/update')
async updateLocation(@Body() locationData: IoTLocationData) {
  // Process and validate IoT data
  const processedData = await this.processIoTData(locationData)

  // Insert into Supabase using service role
  const { data, error } = await this.supabaseService
    .from('live_locations')
    .upsert(processedData, {
      onConflict: 'train_number',
      ignoreDuplicates: false
    })

  // Trigger additional processing (ETA calculations, etc.)
  await this.calculateETAs(locationData.trainNumber)

  return { status: 'success', timestamp: new Date().toISOString() }
}
```

#### GET /api/analytics/route-performance

```typescript
// Custom analytics endpoint
@Get('analytics/route-performance')
async getRoutePerformance(@Query('routeId') routeId: string) {
  // Complex analytics that require multiple joins and calculations
  const performance = await this.supabaseService.rpc('calculate_route_performance', {
    route_id: routeId
  })

  return performance
}
```

## 6. Real-time Features with Supabase

### 6.1 Live Location Updates

```typescript
// Real-time location subscription
const TrainMap = ({ trainNumber }: { trainNumber: string }) => {
  const [location, setLocation] = useState<LiveLocation | null>(null)

  useEffect(() => {
    // Subscribe to location changes
    const subscription = supabase
      .channel('live-locations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_locations',
          filter: `train_number=eq.${trainNumber}`
        },
        (payload) => {
          console.log('Location update:', payload)
          setLocation(payload.new as LiveLocation)
        }
      )
      .subscribe()

    return () => subscription.unsubscribe()
  }, [trainNumber])

  return (
    <div>
      {location && (
        <Map
          center={[location.latitude, location.longitude]}
          trainLocation={location}
        />
      )}
    </div>
  )
}
```

### 6.2 Broadcast Updates

```typescript
// Broadcast system-wide updates
const broadcastTrainStatus = async (trainNumber: string, status: string) => {
  const channel = supabase.channel('train-status');

  await channel.send({
    type: 'broadcast',
    event: 'status-update',
    payload: {
      trainNumber,
      status,
      timestamp: new Date().toISOString(),
    },
  });
};

// Listen for broadcasts
useEffect(() => {
  const channel = supabase.channel('train-status');

  channel
    .on('broadcast', { event: 'status-update' }, (payload) => {
      console.log('Status update:', payload);
      // Update UI accordingly
    })
    .subscribe();

  return () => channel.unsubscribe();
}, []);
```

## 7. Updated Deployment Architecture

### 7.1 Simplified Deployment with Supabase

```yaml
# docker-compose.yml (for local development only)
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - '3000:3000'
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

  # Optional: Custom NestJS service for complex logic
  api-service:
    build: ./api-service
    ports:
      - '3001:3001'
    environment:
      - SUPABASE_URL=your-supabase-url
      - SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
      - SUPABASE_ANON_KEY=your-anon-key
```

### 7.2 Production Deployment

#### Supabase Configuration

1. **Database**: Automatically managed PostgreSQL
2. **Authentication**: Built-in user management
3. **Real-time**: WebSocket connections handled
4. **Storage**: File uploads if needed
5. **Edge Functions**: For serverless logic (alternative to NestJS)

#### Frontend Deployment (Vercel)

```bash
# Environment variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### Custom API Service (if needed)

```bash
# Railway/Render deployment
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 8. Security with Supabase

### 8.1 Row Level Security (RLS) Policies

```sql
-- Admin-only access for route management
CREATE POLICY "Admin route access" ON routes
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Public read access for live locations
CREATE POLICY "Public location read" ON live_locations
  FOR SELECT USING (true);

-- Service role for IoT updates
CREATE POLICY "Service location write" ON live_locations
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' = 'service_role'
  );
```

### 8.2 Authentication & Authorization

```typescript
// Middleware for admin routes
const requireAdmin = async (req: NextRequest) => {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser(token);

  if (!user) {
    return new Response('Invalid token', { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return new Response('Admin access required', { status: 403 });
  }

  return null; // Continue to handler
};
```

## 9. Performance Optimization with Supabase

### 9.1 Database Optimization

```sql
-- Optimized indexes
CREATE INDEX CONCURRENTLY idx_live_locations_train_time
ON live_locations(train_number, timestamp DESC);

CREATE INDEX CONCURRENTLY idx_route_stations_route_sequence
ON route_stations(route_id, sequence);

-- Partial indexes for active routes
CREATE INDEX CONCURRENTLY idx_routes_active
ON routes(train_number) WHERE is_active = true;
```

### 9.2 Real-time Optimization

```typescript
// Optimized real-time subscriptions
const useOptimizedTracking = (trainNumber: string) => {
  const [location, setLocation] = useState<LiveLocation | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Throttle updates to prevent excessive re-renders
    let lastUpdate = 0;
    const THROTTLE_MS = 1000; // 1 second

    const subscription = supabase
      .channel(`train-${trainNumber}`, {
        config: {
          broadcast: { self: false },
          presence: { key: trainNumber },
        },
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_locations',
          filter: `train_number=eq.${trainNumber}`,
        },
        (payload) => {
          const now = Date.now();
          if (now - lastUpdate > THROTTLE_MS) {
            setLocation(payload.new as LiveLocation);
            lastUpdate = now;
          }
        },
      )
      .on('presence', { event: 'sync' }, () => {
        setIsConnected(true);
      })
      .on('presence', { event: 'leave' }, () => {
        setIsConnected(false);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
        }
      });

    return () => {
      subscription.unsubscribe();
      setIsConnected(false);
    };
  }, [trainNumber]);

  return { location, isConnected };
};
```

### 9.3 Caching Strategy

```typescript
// React Query with Supabase for optimal caching
import { useQuery, useQueryClient } from '@tanstack/react-query';

const useRoutesWithCache = () => {
  const queryClient = useQueryClient();

  // Cache routes data with 5-minute stale time
  const routesQuery = useQuery({
    queryKey: ['routes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('routes')
        .select(
          `
          *,
          route_stations (
            *,
            stations (*)
          )
        `,
        )
        .eq('is_active', true);

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Optimistic updates for route changes
  const updateRouteMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('routes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['routes'] });

      // Snapshot previous value
      const previousRoutes = queryClient.getQueryData(['routes']);

      // Optimistically update
      queryClient.setQueryData(['routes'], (old: any) =>
        old?.map((route: any) =>
          route.id === id ? { ...route, ...updates } : route,
        ),
      );

      return { previousRoutes };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['routes'], context?.previousRoutes);
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });

  return { ...routesQuery, updateRoute: updateRouteMutation };
};
```

## 10. IoT Integration with Supabase

### 10.1 IoT Data Ingestion

```typescript
// IoT Service for sending location data to Supabase
class IoTLocationService {
  private supabase: SupabaseClient;
  private batchSize = 10;
  private flushInterval = 5000; // 5 seconds
  private locationBuffer: LocationUpdate[] = [];

  constructor(serviceRoleKey: string) {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      serviceRoleKey, // Use service role for unrestricted access
    );

    // Auto-flush buffer periodically
    setInterval(() => this.flushBuffer(), this.flushInterval);
  }

  async sendLocationUpdate(locationData: LocationUpdate) {
    this.locationBuffer.push(locationData);

    if (this.locationBuffer.length >= this.batchSize) {
      await this.flushBuffer();
    }
  }

  private async flushBuffer() {
    if (this.locationBuffer.length === 0) return;

    const batch = [...this.locationBuffer];
    this.locationBuffer = [];

    try {
      // Batch insert with upsert
      const { error } = await this.supabase
        .from('live_locations')
        .upsert(batch, {
          onConflict: 'train_number',
          ignoreDuplicates: false,
        });

      if (error) {
        console.error('Failed to insert location batch:', error);
        // Re-add failed items to buffer for retry
        this.locationBuffer.unshift(...batch);
      }
    } catch (error) {
      console.error('Location update error:', error);
      this.locationBuffer.unshift(...batch);
    }
  }

  // Archive old locations using Supabase RPC
  async archiveOldLocations() {
    const { error } = await this.supabase.rpc('archive_old_locations');
    if (error) {
      console.error('Failed to archive old locations:', error);
    }
  }
}
```

### 10.2 Enhanced IoT Simulator

```typescript
// Enhanced IoT simulator with Supabase integration
class AdvancedTrainSimulator {
  private locationService: IoTLocationService;
  private trainConfig: TrainConfig;
  private currentPosition: Position;
  private isRunning: boolean = false;

  constructor(trainConfig: TrainConfig, supabaseServiceKey: string) {
    this.trainConfig = trainConfig;
    this.locationService = new IoTLocationService(supabaseServiceKey);
    this.currentPosition = trainConfig.startPosition;
  }

  async startSimulation() {
    this.isRunning = true;

    while (this.isRunning) {
      // Calculate next position based on route and speed
      const nextPosition = this.calculateNextPosition();

      // Add realistic variations
      const locationWithNoise = this.addGPSNoise(nextPosition);

      // Simulate device characteristics
      const deviceData = this.simulateDeviceData();

      // Create location update
      const locationUpdate: LocationUpdate = {
        train_number: this.trainConfig.trainNumber,
        latitude: locationWithNoise.latitude,
        longitude: locationWithNoise.longitude,
        speed: this.currentSpeed,
        heading: this.currentHeading,
        accuracy: deviceData.accuracy,
        device_id: this.trainConfig.deviceId,
        battery_level: deviceData.batteryLevel,
        signal_strength: deviceData.signalStrength,
        timestamp: new Date().toISOString(),
      };

      // Send to Supabase
      await this.locationService.sendLocationUpdate(locationUpdate);

      // Wait for next update (simulate GPS frequency)
      await this.sleep(this.trainConfig.updateInterval || 5000);
    }
  }

  private calculateNextPosition(): Position {
    // Implement realistic train movement logic
    const route = this.trainConfig.route;
    const currentSegment = this.getCurrentRouteSegment();

    // Calculate movement based on:
    // - Current speed and acceleration
    // - Route curvature and elevation
    // - Station stops and signal delays
    // - Weather conditions

    return this.interpolatePosition(currentSegment);
  }

  private addGPSNoise(position: Position): Position {
    // Add realistic GPS accuracy variations
    const accuracyMeters = 3 + Math.random() * 7; // 3-10 meter accuracy
    const latNoise = (Math.random() - 0.5) * 2 * (accuracyMeters / 111320);
    const lngNoise =
      (Math.random() - 0.5) *
      2 *
      (accuracyMeters /
        (111320 * Math.cos((position.latitude * Math.PI) / 180)));

    return {
      latitude: position.latitude + latNoise,
      longitude: position.longitude + lngNoise,
    };
  }

  private simulateDeviceData() {
    // Simulate realistic device characteristics
    return {
      accuracy: 3 + Math.random() * 7,
      batteryLevel: Math.max(0, this.batteryLevel - 0.1), // Gradual drain
      signalStrength: -50 - Math.random() * 40, // -50 to -90 dBm
    };
  }

  stopSimulation() {
    this.isRunning = false;
  }
}
```

## 11. Advanced Features with Supabase

### 11.1 Supabase Edge Functions

Instead of NestJS, you can use Supabase Edge Functions for serverless logic:

```typescript
// supabase/functions/calculate-eta/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const { trainNumber, destinationStationId } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get current train location
    const { data: currentLocation } = await supabaseAdmin
      .from('live_locations')
      .select('*')
      .eq('train_number', trainNumber)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    // Get route and destination info
    const { data: routeInfo } = await supabaseAdmin
      .from('routes')
      .select(
        `
        *,
        route_stations (
          *,
          stations (*)
        )
      `,
      )
      .eq('train_number', trainNumber)
      .single();

    // Calculate ETA using advanced algorithms
    const eta = calculateAdvancedETA(
      currentLocation,
      routeInfo,
      destinationStationId,
    );

    return new Response(
      JSON.stringify({ eta, timestamp: new Date().toISOString() }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

function calculateAdvancedETA(
  currentLocation: any,
  routeInfo: any,
  destinationId: string,
) {
  // Implement sophisticated ETA calculation
  // Consider: historical data, current speed, weather, traffic, etc.

  const currentSpeed = currentLocation.speed || 0;
  const remainingDistance = calculateRemainingDistance(
    currentLocation,
    routeInfo,
    destinationId,
  );

  // Simple calculation (can be enhanced with ML models)
  const estimatedTimeMinutes = remainingDistance / ((currentSpeed * 60) / 1000);

  return {
    estimatedArrival: new Date(
      Date.now() + estimatedTimeMinutes * 60000,
    ).toISOString(),
    distanceRemaining: remainingDistance,
    averageSpeed: currentSpeed,
  };
}
```

### 11.2 Real-time Dashboard with Supabase

```typescript
// Real-time admin dashboard component
const AdminDashboard = () => {
  const [trainStatuses, setTrainStatuses] = useState<TrainStatus[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])

  useEffect(() => {
    // Subscribe to all train location updates
    const locationSubscription = supabase
      .channel('all-locations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_locations'
        },
        (payload) => {
          updateTrainStatus(payload.new as LiveLocation)
        }
      )
      .subscribe()

    // Subscribe to system alerts
    const alertSubscription = supabase
      .channel('system-alerts')
      .on('broadcast', { event: 'alert' }, (payload) => {
        setAlerts(prev => [payload.payload, ...prev.slice(0, 9)]) // Keep last 10
      })
      .subscribe()

    return () => {
      locationSubscription.unsubscribe()
      alertSubscription.unsubscribe()
    }
  }, [])

  const updateTrainStatus = (location: LiveLocation) => {
    setTrainStatuses(prev =>
      prev.map(status =>
        status.trainNumber === location.train_number
          ? { ...status, lastUpdate: location.timestamp, location }
          : status
      )
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Live Train Status Cards */}
      <div className="lg:col-span-2">
        <h2 className="text-2xl font-bold mb-4">Live Train Status</h2>
        <div className="grid gap-4">
          {trainStatuses.map(status => (
            <TrainStatusCard key={status.trainNumber} status={status} />
          ))}
        </div>
      </div>

      {/* System Alerts */}
      <div>
        <h2 className="text-2xl font-bold mb-4">System Alerts</h2>
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <AlertCard key={index} alert={alert} />
          ))}
        </div>
      </div>
    </div>
  )
}
```

### 11.3 Advanced Analytics with Supabase

```sql
-- Create analytics views and functions in Supabase

-- View: Train performance metrics
CREATE VIEW train_performance AS
SELECT
  r.train_number,
  r.name as route_name,
  COUNT(DISTINCT DATE(lh.timestamp)) as days_active,
  AVG(lh.speed) as avg_speed,
  MAX(lh.speed) as max_speed,
  COUNT(lh.id) as total_location_points,
  DATE_TRUNC('hour', lh.timestamp) as hour_bucket,
  AVG(lh.speed) as hourly_avg_speed
FROM routes r
JOIN location_history lh ON r.train_number = lh.train_number
WHERE lh.timestamp >= NOW() - INTERVAL '30 days'
GROUP BY 1, 2, 7
ORDER BY r.train_number, hour_bucket;

-- Function: Calculate route delays
CREATE OR REPLACE FUNCTION calculate_route_delays(
  p_train_number VARCHAR DEFAULT NULL,
  p_days_back INTEGER DEFAULT 7
)
RETURNS TABLE (
  train_number VARCHAR,
  station_name VARCHAR,
  scheduled_time TIME,
  avg_actual_time TIME,
  avg_delay_minutes INTEGER
) AS $
BEGIN
  RETURN QUERY
  SELECT
    r.train_number,
    s.name as station_name,
    rs.estimated_duration::TIME as scheduled_time,
    AVG(lh.timestamp::TIME) as avg_actual_time,
    EXTRACT(EPOCH FROM (AVG(lh.timestamp::TIME) - rs.estimated_duration::TIME))/60 as avg_delay_minutes
  FROM routes r
  JOIN route_stations rs ON r.id = rs.route_id
  JOIN stations s ON rs.station_id = s.id
  JOIN location_history lh ON r.train_number = lh.train_number
  WHERE (p_train_number IS NULL OR r.train_number = p_train_number)
    AND lh.timestamp >= NOW() - INTERVAL p_days_back DAY
    AND ST_DWithin(
      ST_Point(lh.longitude, lh.latitude)::geography,
      ST_Point(s.longitude, s.latitude)::geography,
      500 -- Within 500 meters of station
    )
  GROUP BY 1, 2, 3
  ORDER BY r.train_number, rs.sequence;
END;
$ LANGUAGE plpgsql;

-- Function: Get popular routes
CREATE OR REPLACE FUNCTION get_popular_routes(p_days_back INTEGER DEFAULT 30)
RETURNS TABLE (
  train_number VARCHAR,
  route_name VARCHAR,
  tracking_sessions BIGINT,
  avg_session_duration INTERVAL
) AS $
BEGIN
  -- This would require session tracking in your app
  -- Placeholder for analytics implementation
  RETURN QUERY
  SELECT
    r.train_number,
    r.name as route_name,
    COUNT(DISTINCT lh.timestamp::DATE) as tracking_sessions,
    INTERVAL '0' as avg_session_duration
  FROM routes r
  JOIN location_history lh ON r.train_number = lh.train_number
  WHERE lh.timestamp >= NOW() - INTERVAL p_days_back DAY
  GROUP BY 1, 2
  ORDER BY tracking_sessions DESC;
END;
$ LANGUAGE plpgsql;
```

## 12. Testing Strategy with Supabase

### 12.1 Database Testing

```typescript
// Test setup with Supabase Test Client
import { createClient } from '@supabase/supabase-js';

const supabaseTest = createClient(
  process.env.SUPABASE_TEST_URL!,
  process.env.SUPABASE_TEST_SERVICE_KEY!,
);

describe('Route Management', () => {
  beforeEach(async () => {
    // Clean test database
    await supabaseTest
      .from('route_stations')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseTest
      .from('routes')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseTest
      .from('stations')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
  });

  it('should create route with stations', async () => {
    // Create test stations
    const { data: stations } = await supabaseTest
      .from('stations')
      .insert([
        {
          name: 'Station A',
          code: 'STA',
          latitude: 12.9716,
          longitude: 77.5946,
          city: 'City A',
          state: 'State A',
        },
        {
          name: 'Station B',
          code: 'STB',
          latitude: 13.0827,
          longitude: 80.2707,
          city: 'City B',
          state: 'State B',
        },
      ])
      .select();

    // Create route
    const { data: route } = await supabaseTest
      .from('routes')
      .insert({
        train_number: 'TEST_001',
        name: 'Test Route',
      })
      .select()
      .single();

    // Add stations to route
    const { data: routeStations } = await supabaseTest
      .from('route_stations')
      .insert([
        {
          route_id: route.id,
          station_id: stations[0].id,
          sequence: 1,
          distance_from_start: 0,
        },
        {
          route_id: route.id,
          station_id: stations[1].id,
          sequence: 2,
          distance_from_start: 100,
        },
      ])
      .select();

    expect(routeStations).toHaveLength(2);
    expect(routeStations[0].sequence).toBe(1);
    expect(routeStations[1].sequence).toBe(2);
  });
});
```

### 12.2 Real-time Testing

```typescript
// Test real-time subscriptions
describe('Real-time Location Updates', () => {
  it('should receive location updates in real-time', async () => {
    const receivedUpdates: LiveLocation[] = [];

    // Set up subscription
    const subscription = supabaseTest
      .channel('test-locations')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'live_locations',
        },
        (payload) => {
          receivedUpdates.push(payload.new as LiveLocation);
        },
      )
      .subscribe();

    // Wait for subscription to be ready
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Insert test location
    const testLocation = {
      train_number: 'TEST_001',
      latitude: 12.9716,
      longitude: 77.5946,
      speed: 60,
      timestamp: new Date().toISOString(),
    };

    await supabaseTest.from('live_locations').insert(testLocation);

    // Wait for real-time update
    await new Promise((resolve) => setTimeout(resolve, 2000));

    expect(receivedUpdates).toHaveLength(1);
    expect(receivedUpdates[0].train_number).toBe('TEST_001');

    subscription.unsubscribe();
  });
});
```

## 13. Security Best Practices with Supabase

### 13.1 Advanced RLS Policies

```sql
-- Time-based access control
CREATE POLICY "Admin access during business hours" ON routes
  FOR ALL TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin' AND
    EXTRACT(HOUR FROM NOW()) BETWEEN 6 AND 22 -- 6 AM to 10 PM
  );

-- IP-based restrictions (requires custom claims in JWT)
CREATE POLICY "Admin IP whitelist" ON routes
  FOR ALL TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin' AND
    auth.jwt() ->> 'ip_address' = ANY('{192.168.1.0/24,10.0.0.0/8}'::text[])
  );

-- Rate limiting using custom function
CREATE OR REPLACE FUNCTION check_rate_limit(user_id UUID, action_type TEXT, max_per_hour INTEGER)
RETURNS BOOLEAN AS $
DECLARE
  current_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO current_count
  FROM audit_log
  WHERE user_id = check_rate_limit.user_id
    AND action = action_type
    AND created_at > NOW() - INTERVAL '1 hour';

  RETURN current_count < max_per_hour;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply rate limiting to sensitive operations
CREATE POLICY "Rate limited route creation" ON routes
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin' AND
    check_rate_limit(auth.uid(), 'route_create', 10)
  );
```

### 13.2 Audit Logging

```sql
-- Audit log table
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(50) NOT NULL,
  table_name VARCHAR(50) NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $
BEGIN
  INSERT INTO audit_log (
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values,
    ip_address
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    inet_client_addr()
  );

  RETURN COALESCE(NEW, OLD);
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to sensitive tables
CREATE TRIGGER routes_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON routes
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER stations_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON stations
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();
```

## 14. Monitoring and Analytics with Supabase

### 14.1 Custom Metrics Dashboard

```typescript
// Supabase metrics collection
const useSystemMetrics = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)

  useEffect(() => {
    const fetchMetrics = async () => {
      // Get real-time train count
      const { count: activeTrains } = await supabase
        .from('live_locations')
        .select('train_number', { count: 'exact', head: true })
        .gte('timestamp', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Last 5 minutes

      // Get route performance
      const { data: routePerformance } = await supabase
        .rpc('calculate_route_delays', { p_days_back: 1 })

      // Get system health
      const { data: systemHealth } = await supabase
        .from('live_locations')
        .select('device_id, battery_level, signal_strength')
        .gte('timestamp', new Date(Date.now() - 10 * 60 * 1000).toISOString())

      setMetrics({
        activeTrains: activeTrains || 0,
        routePerformance: routePerformance || [],
        avgBattery: systemHealth?.reduce((sum, d) => sum + (d.battery_level || 0), 0) / (systemHealth?.length || 1),
        avgSignal: systemHealth?.reduce((sum, d) => sum + (d.signal_strength || 0), 0) / (systemHealth?.length || 1)
      })
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return metrics
}

// Metrics dashboard component
const MetricsDashboard = () => {
  const metrics = useSystemMetrics()

  if (!metrics) return <div>Loading metrics...</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Active Trains"
        value={metrics.activeTrains}
        icon="🚂"
        trend={"+5% from yesterday"}
      />
      <MetricCard
        title="Avg Battery"
        value={`${metrics.avgBattery.toFixed(1)}%`}
        icon="🔋"
        trend={metrics.avgBattery > 80 ? "Good" : "Monitor"}
      />
      <MetricCard
        title="Signal Strength"
        value={`${metrics.avgSignal.toFixed(0)} dBm`}
        icon="📡"
        trend={metrics.avgSignal > -70 ? "Strong" : "Weak"}
      />
      <MetricCard
        title="Routes Active"
        value={metrics.routePerformance.length}
        icon="🛤️"
        trend="All operational"
      />
    </div>
  )
}
```

## 15. Conclusion

This updated system design leverages Supabase's comprehensive platform to significantly simplify the architecture while providing robust features:

### Key Benefits of Supabase Integration:

1. **Simplified Architecture**: Single platform for database, auth, real-time, and API
2. **Built-in Security**: Row Level Security policies protect data automatically
3. **Real-time by Default**: WebSocket connections handled seamlessly
4. **Instant APIs**: Auto-generated REST and GraphQL APIs
5. **Scalable Infrastructure**: Managed PostgreSQL with built-in scaling
6. **Developer Experience**: Type-safe client libraries and excellent tooling

### Recommended Implementation Approach:

1. **Phase 1**: Core functionality using Supabase auto-generated APIs
2. **Phase 2**: Add real-time tracking with Supabase Realtime
3. **Phase 3**: Implement advanced features with Edge Functions
4. **Phase 4**: Add analytics and monitoring dashboards
5. **Phase 5**: Scale with custom business logic if needed

This architecture provides a solid foundation that can handle both simple tracking needs and complex railway management requirements while maintaining excellent performance and security standards.
