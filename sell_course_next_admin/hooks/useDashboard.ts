import { useState, useEffect, useCallback } from 'react';
import { clientDashboardApi, ClientDashboardApiError } from '../lib/client-dashboard-api';
import {
  DashboardOverview,
  RevenueAnalytics,
  UserStatistics,
  CoursePerformance,
  EnrollmentTrends,
  RecentActivities,
  DashboardClearCacheResponse,
  DashboardHealthResponse,
} from '../app/types/dashboard';

// Hook for dashboard overview
export const useDashboardOverview = () => {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await clientDashboardApi.getDashboardOverview();
      setData(result);
    } catch (err) {
      setError(err instanceof ClientDashboardApiError ? err.message : 'Failed to fetch dashboard overview');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

// Hook for revenue analytics
export const useRevenueAnalytics = () => {
  const [data, setData] = useState<RevenueAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await clientDashboardApi.getRevenueAnalytics();
      setData(result);
    } catch (err) {
      setError(err instanceof ClientDashboardApiError ? err.message : 'Failed to fetch revenue analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

// Hook for user statistics
export const useUserStatistics = () => {
  const [data, setData] = useState<UserStatistics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await clientDashboardApi.getUserStatistics();
      setData(result);
    } catch (err) {
      setError(err instanceof ClientDashboardApiError ? err.message : 'Failed to fetch user statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

// Hook for course performance
export const useCoursePerformance = () => {
  const [data, setData] = useState<CoursePerformance | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await clientDashboardApi.getCoursePerformance();
      setData(result);
    } catch (err) {
      setError(err instanceof ClientDashboardApiError ? err.message : 'Failed to fetch course performance');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

// Hook for enrollment trends
export const useEnrollmentTrends = () => {
  const [data, setData] = useState<EnrollmentTrends | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await clientDashboardApi.getEnrollmentTrends();
      setData(result);
    } catch (err) {
      setError(err instanceof ClientDashboardApiError ? err.message : 'Failed to fetch enrollment trends');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

// Hook for recent activities
export const useRecentActivities = (limit: number = 50) => {
  const [data, setData] = useState<RecentActivities | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await clientDashboardApi.getRecentActivities(limit);
      setData(result);
    } catch (err) {
      setError(err instanceof ClientDashboardApiError ? err.message : 'Failed to fetch recent activities');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

// Hook for all dashboard data
export const useAllDashboardData = () => {
  const [data, setData] = useState<{
    overview: DashboardOverview;
    revenueAnalytics: RevenueAnalytics;
    userStatistics: UserStatistics;
    coursePerformance: CoursePerformance;
    enrollmentTrends: EnrollmentTrends;
    recentActivities: RecentActivities;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await clientDashboardApi.getAllDashboardData();
      setData(result);
    } catch (err) {
      setError(err instanceof ClientDashboardApiError ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

// Hook for cache management
export const useDashboardCache = () => {
  const [clearing, setClearing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearCache = useCallback(async (): Promise<DashboardClearCacheResponse | null> => {
    try {
      setClearing(true);
      setError(null);
      const result = await clientDashboardApi.clearDashboardCache();
      return result;
    } catch (err) {
      setError(err instanceof ClientDashboardApiError ? err.message : 'Failed to clear cache');
      return null;
    } finally {
      setClearing(false);
    }
  }, []);

  return { clearCache, clearing, error };
};

// Hook for health check
export const useDashboardHealth = () => {
  const [data, setData] = useState<DashboardHealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await clientDashboardApi.checkHealth();
      setData(result);
    } catch (err) {
      setError(err instanceof ClientDashboardApiError ? err.message : 'Failed to check health');
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, checkHealth };
};