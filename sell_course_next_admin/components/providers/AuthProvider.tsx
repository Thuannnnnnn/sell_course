'use client';

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { useTokenRefresh } from '@/hooks/useTokenRefresh';

interface AuthProviderProps {
  children: ReactNode;
}

function TokenRefreshHandler() {
  useTokenRefresh();
  return null;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider>
      <TokenRefreshHandler />
      {children}
    </SessionProvider>
  );
}
