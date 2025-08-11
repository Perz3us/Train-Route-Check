import { useEffect, useState, useCallback } from 'react';
import { User, AuthResponse } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    console.log('fetchProfile: Attempting to fetch profile for userId:', userId);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('fetchProfile: Error fetching profile:', error);
      setProfile(null);
    } else if (data) {
      console.log('fetchProfile: Profile data received:', data);
      setProfile(data);
    } else {
      console.log('fetchProfile: No profile data found for userId:', userId);
      setProfile(null);
    }
    return data;
  }, []);

  useEffect(() => {
    console.log('useAuth: useEffect started');
    const checkUser = async () => {
      setLoading(true);
      console.log('useAuth: checkUser started');
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log('useAuth: session fetched', session);
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log('useAuth: user found, fetching profile');
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('useAuth: onAuthStateChange event', event);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signUp = async (
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    return supabase.auth.signUp({ email, password });
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
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

      const { tokens } = result;

      if (!tokens) {
        throw new Error('Invalid login response from server');
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      });

      if (sessionError) {
        throw sessionError;
      }

      // onAuthStateChange will handle setting user and profile.
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message } };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);
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
