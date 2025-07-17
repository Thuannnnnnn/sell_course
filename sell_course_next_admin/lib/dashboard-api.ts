import { getServerSession } from 'next-auth';
import { authOptions } from './authOptions';
import {
  DashboardOverview,
  RevenueAnalytics,
  UserStatistics,
  CoursePerformance,
  EnrollmentTrends,
  RecentActivities,
  DashboardClearCacheResponse,
  DashboardHealthResponse
} from '../app/types/dashboard';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

class DashboardApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public timestamp: string = new Date().toISOString()
  ) {
    super(message);
    this.name = 'DashboardApiError';
  }
}

class DashboardApiService {
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      throw new DashboardApiError('No authentication token available', 401);
    }

    return {
      'Authorization': `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/api/dashboard${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'An error occurred';
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || `HTTP ${response.status}`;
      }

      throw new DashboardApiError(
        errorMessage,
        response.status
      );
    }

    const data = await response.json();
    return data as T;
  }

  /**
   * Get dashboard overview with KPIs and growth metrics
   */
  async getDashboardOverview(): Promise<DashboardOverview> {
    return this.makeRequest<DashboardOverview>('/overview');
  }

  /**
   * Get detailed revenue analytics
   */
  async getRevenueAnalytics(): Promise<RevenueAnalytics> {
    return this.makeRequest<RevenueAnalytics>('/revenue-analytics');
  }

  /**
   * Get user statistics including growth and role distribution
   */
  async getUserStatistics(): Promise<UserStatistics> {
    return this.makeRequest<UserStatistics>('/user-statistics');
  }

  /**
   * Get course performance analytics
   */
  async getCoursePerformance(): Promise<CoursePerformance> {
    return this.makeRequest<CoursePerformance>('/course-performance');
  }

  /**
   * Get enrollment trends and patterns
   */
  async getEnrollmentTrends(): Promise<EnrollmentTrends> {
    return this.makeRequest<EnrollmentTrends>('/enrollment-trends');
  }

  /**
   * Get recent system activities
   * @param limit - Number of activities to retrieve (default: 50, max: 100)
   */
  async getRecentActivities(limit: number = 50): Promise<RecentActivities> {
    if (limit < 1 || limit > 100) {
      limit = 50;
    }
    
    return this.makeRequest<RecentActivities>(`/recent-activities?limit=${limit}`);
  }

  /**
   * Clear dashboard cache
   */
  async clearDashboardCache(): Promise<DashboardClearCacheResponse> {
    return this.makeRequest<DashboardClearCacheResponse>('/clear-cache', {
      method: 'POST',
    });
  }

  /**
   * Check dashboard service health
   */
  async checkHealth(): Promise<DashboardHealthResponse> {
    return this.makeRequest<DashboardHealthResponse>('/health');
  }

  /**
   * Get all dashboard data at once
   */
  async getAllDashboardData(): Promise<{
    overview: DashboardOverview;
    revenueAnalytics: RevenueAnalytics;
    userStatistics: UserStatistics;
    coursePerformance: CoursePerformance;
    enrollmentTrends: EnrollmentTrends;
    recentActivities: RecentActivities;
  }> {
    const [
      overview,
      revenueAnalytics,
      userStatistics,
      coursePerformance,
      enrollmentTrends,
      recentActivities
    ] = await Promise.all([
      this.getDashboardOverview(),
      this.getRevenueAnalytics(),
      this.getUserStatistics(),
      this.getCoursePerformance(),
      this.getEnrollmentTrends(),
      this.getRecentActivities()
    ]);

    return {
      overview,
      revenueAnalytics,
      userStatistics,
      coursePerformance,
      enrollmentTrends,
      recentActivities
    };
  }
}

// Export singleton instance
export const dashboardApi = new DashboardApiService();
export { DashboardApiError };
export default dashboardApi;