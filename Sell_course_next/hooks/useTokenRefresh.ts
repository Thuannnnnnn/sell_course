import { useSession, signOut } from 'next-auth/react';
import { useCallback, useEffect } from 'react';
import { refreshAccessToken, isTokenExpired } from '@/lib/utils/refreshToken';

export function useTokenRefresh() {
  const { data: session, update } = useSession();

  const checkAndRefreshToken = useCallback(async () => {
    if (!session?.accessToken || !session?.refreshToken) {
      return false;
    }

    // Check if we have access token expiration info
    // In a real scenario, you'd want to decode the JWT to get expiration
    // For now, we'll assume tokens expire every 2 hours
    const tokenIssuedAt = new Date(session.expires).getTime() - (2 * 60 * 60 * 1000);
    const tokenExpiresAt = Math.floor((tokenIssuedAt + (2 * 60 * 60 * 1000)) / 1000);

    if (isTokenExpired(tokenExpiresAt)) {
      try {
        const refreshedTokens = await refreshAccessToken(session.refreshToken);
        
        if (refreshedTokens) {
          // Update the session with new tokens
          await update({
            ...session,
            accessToken: refreshedTokens.token,
            refreshToken: refreshedTokens.refreshToken,
            expires: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          });
          return true;
        } else {
          // Refresh failed, sign out user
          await signOut({ callbackUrl: '/auth/login' });
          return false;
        }
      } catch (error) {
        console.error('Error refreshing token:', error);
        await signOut({ callbackUrl: '/auth/login' });
        return false;
      }
    }

    return true;
  }, [session, update]);

  useEffect(() => {
    if (session) {
      // Check token validity every 30 minutes
      const interval = setInterval(checkAndRefreshToken, 30 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [session, checkAndRefreshToken]);

  return {
    checkAndRefreshToken,
  };
}
