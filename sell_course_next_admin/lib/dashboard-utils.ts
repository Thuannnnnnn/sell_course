import { 
  DashboardOverview, 
  RevenueAnalytics, 
  UserStatistics, 
  CoursePerformance,
  EnrollmentTrends
} from '../app/types/dashboard';

/**
 * Format currency with proper locale and currency symbol
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format large numbers with K, M, B suffixes
 */
export const formatLargeNumber = (num: number): string => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * Format percentage with proper decimal places
 */
export const formatPercentage = (percentage: number, decimals: number = 1): string => {
  return `${percentage.toFixed(decimals)}%`;
};

/**
 * Calculate growth rate between two values
 */
export const calculateGrowthRate = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Get growth trend indicator
 */
export const getGrowthTrend = (growthRate: number): {
  trend: 'up' | 'down' | 'neutral';
  color: string;
  icon: string;
} => {
  if (growthRate > 0) {
    return { trend: 'up', color: 'text-green-600', icon: '↗' };
  } else if (growthRate < 0) {
    return { trend: 'down', color: 'text-red-600', icon: '↘' };
  } else {
    return { trend: 'neutral', color: 'text-gray-600', icon: '→' };
  }
};

/**
 * Calculate time ago from timestamp
 */
export const timeAgo = (timestamp: Date | string): string => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / seconds);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
    }
  }

  return 'Just now';
};

/**
 * Get activity type color and icon
 */
export const getActivityStyle = (type: string): {
  color: string;
  backgroundColor: string;
  icon: string;
} => {
  const styles = {
    enrollment: { color: 'text-blue-600', backgroundColor: 'bg-blue-100', icon: '👥' },
    course_created: { color: 'text-green-600', backgroundColor: 'bg-green-100', icon: '📚' },
    user_registered: { color: 'text-purple-600', backgroundColor: 'bg-purple-100', icon: '👤' },
    forum_post: { color: 'text-orange-600', backgroundColor: 'bg-orange-100', icon: '💬' },
    course_completed: { color: 'text-teal-600', backgroundColor: 'bg-teal-100', icon: '🏆' },
    payment_received: { color: 'text-yellow-600', backgroundColor: 'bg-yellow-100', icon: '💰' },
  };

  return styles[type as keyof typeof styles] || {
    color: 'text-gray-600',
    backgroundColor: 'bg-gray-100',
    icon: '📋'
  };
};

/**
 * Calculate dashboard health score
 */
export const calculateHealthScore = (data: {
  overview?: DashboardOverview;
  revenue?: RevenueAnalytics;
  users?: UserStatistics;
  courses?: CoursePerformance;
  enrollments?: EnrollmentTrends;
}): {
  score: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  factors: Array<{ name: string; score: number; weight: number }>;
} => {
  const factors = [];

  // User growth factor (20% weight)
  if (data.overview) {
    const userGrowthScore = Math.min(Math.max(data.overview.userGrowthPercentage * 10, 0), 100);
    factors.push({ name: 'User Growth', score: userGrowthScore, weight: 0.2 });
  }

  // Revenue growth factor (25% weight)
  if (data.overview) {
    const revenueGrowthScore = Math.min(Math.max(data.overview.revenueGrowthPercentage * 10, 0), 100);
    factors.push({ name: 'Revenue Growth', score: revenueGrowthScore, weight: 0.25 });
  }

  // Course completion factor (20% weight)
  if (data.overview) {
    const completionScore = data.overview.completionRate;
    factors.push({ name: 'Course Completion', score: completionScore, weight: 0.2 });
  }

  // Enrollment growth factor (20% weight)
  if (data.overview) {
    const enrollmentGrowthScore = Math.min(Math.max(data.overview.enrollmentGrowthPercentage * 10, 0), 100);
    factors.push({ name: 'Enrollment Growth', score: enrollmentGrowthScore, weight: 0.2 });
  }

  // Course rating factor (15% weight)
  if (data.courses) {
    const ratingScore = (data.courses.averageRating / 5) * 100;
    factors.push({ name: 'Course Rating', score: ratingScore, weight: 0.15 });
  }

  // Calculate weighted score
  const totalWeight = factors.reduce((sum, factor) => sum + factor.weight, 0);
  const score = factors.reduce((sum, factor) => sum + (factor.score * factor.weight), 0) / totalWeight;

  let status: 'excellent' | 'good' | 'fair' | 'poor';
  if (score >= 80) status = 'excellent';
  else if (score >= 60) status = 'good';
  else if (score >= 40) status = 'fair';
  else status = 'poor';

  return { score: Math.round(score), status, factors };
};

/**
 * Get trending courses based on enrollment growth
 */
export const getTrendingCourses = (courses: CoursePerformance) => {
  return courses.topCourses
    .filter(course => course.enrollments > 0)
    .sort((a, b) => b.enrollments - a.enrollments)
    .slice(0, 5);
};

/**
 * Calculate conversion rate for enrollment trends
 */
export const calculateConversionRate = (paidEnrollments: number, totalEnrollments: number): number => {
  if (totalEnrollments === 0) return 0;
  return (paidEnrollments / totalEnrollments) * 100;
};

/**
 * Get monthly comparison data
 */
export const getMonthlyComparison = (data: {
  current: number;
  previous: number;
  label: string;
}) => {
  const difference = data.current - data.previous;
  const percentage = data.previous === 0 ? 0 : (difference / data.previous) * 100;
  const trend = getGrowthTrend(percentage);

  return {
    ...data,
    difference,
    percentage,
    trend,
    formattedPercentage: formatPercentage(Math.abs(percentage)),
  };
};

/**
 * Validate dashboard data completeness
 */
export const validateDashboardData = (data: unknown): {
  isValid: boolean;
  missingFields: string[];
  warnings: string[];
} => {
  const missingFields: string[] = [];
  const warnings: string[] = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, missingFields: ['all data'], warnings: [] };
  }

  // Type for validation - all fields are optional since we're validating completeness
  type DashboardDataValidation = {
    overview?: {
      totalUsers?: number;
      totalCourses?: number;
    };
    revenueAnalytics?: {
      totalRevenue?: number;
    };
    userStatistics?: unknown;
    coursePerformance?: unknown;
    enrollmentTrends?: unknown;
  };

  // Type assertion to treat data as dashboard data structure
  const dataObj = data as DashboardDataValidation;

  // Check required fields
  const requiredFields: (keyof DashboardDataValidation)[] = ['overview', 'revenueAnalytics', 'userStatistics', 'coursePerformance', 'enrollmentTrends'];
  
  requiredFields.forEach(field => {
    if (!dataObj[field]) {
      missingFields.push(field);
    }
  });

  // Check for data quality issues
  if (dataObj.overview && dataObj.overview.totalUsers === 0) {
    warnings.push('No users found in the system');
  }

  if (dataObj.overview && dataObj.overview.totalCourses === 0) {
    warnings.push('No courses found in the system');
  }

  if (dataObj.revenueAnalytics && dataObj.revenueAnalytics.totalRevenue === 0) {
    warnings.push('No revenue recorded');
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
    warnings,
  };
};

/**
 * Export data to CSV format
 */
export const exportToCsv = (data: Record<string, unknown>[], filename: string): void => {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => 
    Object.values(row).map(value => 
      typeof value === 'string' ? `"${value}"` : value
    ).join(',')
  );

  const csvContent = [headers, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  
  window.URL.revokeObjectURL(url);
};

/**
 * Check if data is stale (older than specified minutes)
 */
export const isDataStale = (timestamp: Date | string, maxAgeMinutes: number = 5): boolean => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const now = new Date();
  const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);
  return diffInMinutes > maxAgeMinutes;
};