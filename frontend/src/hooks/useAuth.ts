import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

// Define types for our custom authentication
interface User {
  id: string;
  email: string;
}

interface Profile {
  id: string;
  email: string;
  fullName: string;
  role: string;
  avatarUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  lastLoginAt?: Date | null;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

interface LoginResponse {
  tokens: AuthTokens;
  user: Profile;
  message: string;
  timestamp: Date;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Get token from cookies
  const getToken = useCallback(() => {
    if (typeof window !== 'undefined') {
      return Cookies.get('authToken');
    }
    return null;
  }, []);

  // Save token to cookies
  const saveToken = useCallback((token: string) => {
    if (typeof window !== 'undefined') {
      Cookies.set('authToken', token, { expires: 7, path: '/', sameSite: 'strict' });
    }
  }, []);

  // Remove token from cookies
  const removeToken = useCallback(() => {
    if (typeof window !== 'undefined') {
      Cookies.remove('authToken', { path: '/' });
    }
  }, []);

  // Check user authentication status
  useEffect(() => {
    const checkUser = async () => {
      setLoading(true);
      const token = getToken();
      if (token) {
        // Validate token with backend
        try {
          const response = await fetch('/api/auth/profile', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const profileData = await response.json();
            setUser({ id: profileData.id, email: profileData.email });
            setProfile(profileData);
          } else {
            // Token is invalid, remove it
            removeToken();
          }
        } catch (error) {
          console.error('Error validating token:', error);
          removeToken();
        }
      }
      setLoading(false);
    };

    checkUser();
  }, [getToken, removeToken]);

  // Sign in function
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

      const result: LoginResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to login');
      }

      if (!result.tokens || !result.user) {
        throw new Error('Invalid login response from server');
      }

      // Save token
      saveToken(result.tokens.accessToken);

      // Set user and profile
      setUser({ id: result.user.id, email: result.user.email });
      setProfile(result.user);

      return { error: null, user: result.user };
    } catch (error: any) {
      console.error('signIn: error', error);
      return { error: { message: error.message } };
    } finally {
      setLoading(false);
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, fullName }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to register');
      }

      return { error: null, data: result };
    } catch (error: any) {
      console.error('signUp: error', error);
      return { error: { message: error.message } };
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      const token = getToken();
      if (token) {
        // Call backend logout endpoint
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear local state and token
      removeToken();
      setUser(null);
      setProfile(null);
      router.push('/login');
    }
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