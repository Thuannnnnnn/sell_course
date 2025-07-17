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

class ClientDashboardApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public timestamp: string = new Date().toISOString()
  ) {
    super(message);
    this.name = 'ClientDashboardApiError';
  }
}

class ClientDashboardApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '/api/dashboard';
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `HTTP ${response.status}`;
      
      throw new ClientDashboardApiError(
        errorMessage,
        response.status,
        errorData.timestamp
      );
    }

    return response.json();
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
    return this.makeRequest('/all');
  }
}

// Export singleton instance
export const clientDashboardApi = new ClientDashboardApiService();
export { ClientDashboardApiError };
export default clientDashboardApi;