'use client';

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../hooks/useAuth";

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const AuthGuard = ({ children, fallback }: AuthGuardProps) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(
        `/login?message=Please login to access this page&redirect=${router.asPath}`
      );
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return fallback || <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
