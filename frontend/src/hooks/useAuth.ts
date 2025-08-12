import { useEffect, useState, useCallback } from 'react';
import { User, AuthResponse } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
      return null;
    }

    setProfile(data);
    return data;
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_IN' && session) {
        fetchProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signUp = async (email: string, password: string): Promise<AuthResponse> => {
    return supabase.auth.signUp({ email, password });
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    console.log('signIn: called');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      console.log('signIn: fetch response', response);

      const result = await response.json();
      console.log('signIn: fetch result', result);


      if (!response.ok) {
        throw new Error(result.message || 'Failed to login');
      }

      const { tokens, user: profileData } = result;

      if (!tokens || !profileData) {
        throw new Error('Invalid login response from server');
      }

      console.log('signIn: setting session');
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      });
      console.log('signIn: setSession done', { sessionData, sessionError });

      if (sessionError) {
        throw sessionError;
      }

      setUser(sessionData.user);
      setProfile(profileData);

      console.log('signIn: checking for admin role', profileData.role);
      if (profileData.role === 'admin') {
        console.log('signIn: redirecting to /admin');
        router.push('/admin');
      }

      return { error: null };
    } catch (error: any) {
      console.error('signIn: error', error);
      return { error: { message: error.message } };
    } finally {
      setLoading(false);
      console.log('signIn: finished');
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return {
    user,
    profile,
    loading,
    signIn,
    signOut,
    signUp,
    isAdmin: profile?.role === 'admin',
  };
}
