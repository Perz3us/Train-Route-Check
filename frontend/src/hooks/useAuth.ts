
import { useEffect, useState, useCallback } from 'react';
import { User, AuthResponse } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    console.log("fetchProfile: Attempting to fetch profile for userId:", userId);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("fetchProfile: Error fetching profile:", error);
      setProfile(null); // Ensure profile is null on error
    } else if (data) {
      console.log("fetchProfile: Profile data received:", data);
      setProfile(data);
    } else {
      console.log("fetchProfile: No profile data found for userId:", userId);
      setProfile(null); // No data found
    }
    return data;
  }, []);

  useEffect(() => {
    console.log("useAuth: useEffect started");
    const checkUser = async () => {
      console.log("useAuth: checkUser started");
      const { data: { session } } = await supabase.auth.getSession();
      console.log("useAuth: session fetched", session);
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log("useAuth: user found, fetching profile");
        await fetchProfile(session.user.id);
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("useAuth: onAuthStateChange event", event);
        setLoading(true);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
          setLoading(false);
        } else {
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signUp = async (email: string, password: string): Promise<AuthResponse> => {
    return supabase.auth.signUp({ email, password });
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to login');
      }

      const { tokens, user: profile } = result;

      if (!tokens || !profile) {
        throw new Error('Invalid login response from server');
      }

      // Set the session in Supabase client
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      });

      if (sessionError) {
        throw sessionError;
      }

      // Manually update the user and profile state
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setProfile(profile);

      return { data: { user, profile }, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
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
    signUp,
    isAdmin: profile?.role === 'admin' || user?.user_metadata?.role === 'admin',
  };
}
