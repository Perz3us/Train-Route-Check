
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
