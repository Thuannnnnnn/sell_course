// Dashboard Overview Types
export interface DashboardOverview {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
  newUsersThisMonth: number;
  newCoursesThisMonth: number;
  newEnrollmentsThisMonth: number;
  revenueThisMonth: number;
  userGrowthPercentage: number;
  courseGrowthPercentage: number;
  enrollmentGrowthPercentage: number;
  revenueGrowthPercentage: number;
  activeCourses: number;
  completionRate: number;
}

// Revenue Analytics Types
export interface MonthlyRevenue {
  month: string;
  revenue: number;
  orders: number;
  year: number;
}

export interface RevenueAnalytics {
  monthlyRevenue: MonthlyRevenue[];
  totalRevenue: number;
  averageMonthlyRevenue: number;
  highestRevenueMonth: string;
  lowestRevenueMonth: string;
  revenueGrowthPercentage: number;
  totalPaidEnrollments: number;
  averageOrderValue: number;
}

// User Statistics Types
export interface UserGrowth {
  month: string;
  newUsers: number;
  totalUsers: number;
  year: number;
}

export interface UserRoleDistribution {
  role: string;
  count: number;
  percentage: number;
}

export interface UserStatistics {
  userGrowth: UserGrowth[];
  roleDistribution: UserRoleDistribution[];
  totalActiveUsers: number;
  totalBannedUsers: number;
  newUsersThisMonth: number;
  newUsersLastMonth: number;
  userGrowthPercentage: number;
  averageUsersPerMonth: number;
}

// Course Performance Types
export interface CoursePerformanceItem {
  courseId: string;
  title: string;
  enrollments: number;
  completionRate: number;
  averageRating: number;
  revenue: number;
  category: string;
  isActive: boolean;
  lessonCount: number;
  duration: number;
}

export interface CategoryPerformance {
  categoryName: string;
  courseCount: number;
  totalEnrollments: number;
  averageCompletionRate: number;
  totalRevenue: number;
}

export interface CoursePerformance {
  topCourses: CoursePerformanceItem[];
  categoryPerformance: CategoryPerformance[];
  totalCourses: number;
  activeCourses: number;
  averageCompletionRate: number;
  mostPopularCategory: string;
  averageRating: number;
}

// Enrollment Trends Types
export interface MonthlyEnrollment {
  month: string;
  enrollments: number;
  paidEnrollments: number;
  freeEnrollments: number;
  completionRate: number;
  year: number;
}

export interface EnrollmentStatus {
  status: string;
  count: number;
  percentage: number;
}

export interface EnrollmentTrends {
  monthlyTrends: MonthlyEnrollment[];
  statusDistribution: EnrollmentStatus[];
  totalEnrollments: number;
  enrollmentsThisMonth: number;
  enrollmentsLastMonth: number;
  enrollmentGrowthPercentage: number;
  averageEnrollmentsPerMonth: number;
  peakEnrollmentMonth: string;
  conversionRate: number;
}

// Recent Activities Types
export interface RecentActivity {
  id: string;
  type: 'enrollment' | 'course_created' | 'user_registered' | 'forum_post' | 'course_completed' | 'payment_received';
  description: string;
  userName: string;
  userId: string;
  courseTitle?: string;
  courseId?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface RecentActivities {
  activities: RecentActivity[];
  totalCount: number;
  last24Hours: number;
  lastWeek: number;
  mostActiveHour: string;
  mostFrequentActivityType: string;
}

// API Response Types
export interface DashboardClearCacheResponse {
  message: string;
  timestamp: string;
}

export interface DashboardHealthResponse {
  status: string;
  service: string;
  timestamp: string;
  uptime: string;
}

// Error Types
export interface DashboardApiError {
  message: string;
  statusCode: number;
  timestamp: string;
}