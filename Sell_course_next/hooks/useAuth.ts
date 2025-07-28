'use client';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation'; 
import { useCallback, useEffect, useMemo } from 'react';

export const useAuth = () => {
  const { data: session, status } = useSession();
  const router = useRouter(); 

  const isAuthenticated = !!session?.user;
  const loading = status === 'loading';
  const token = useMemo(() => session?.accessToken || '', [session]);

  const checkAuth = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        await signOut({ redirect: false });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await signOut({ redirect: false });
    }
  }, [token]);

  const login = useCallback(async (credentials?: { email: string; password: string }) => {
    try {
      const result = await signIn('credentials', {
        ...credentials,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      return result;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut({ redirect: false });
      router.push('/auth/login'); 
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [router]);

  useEffect(() => {
    if (token) {
      checkAuth();
    }
  }, [token, checkAuth]);

  return {
    isAuthenticated,
    loading,
    user: session?.user,
    token,
    session,
    login,
    logout,
    checkAuth,
  };
};
