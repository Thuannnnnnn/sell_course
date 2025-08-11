import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { User } from '../user/entities/user.entity';
import { Course } from '../course/entities/course.entity';
import { CourseStatus } from '../course/enums/course-status.enum';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { Category } from '../category/entities/category.entity';
import { ResultExam } from '../result_exam/entities/result_exam.entity';
import { ProgressTracking } from '../progress_tracking/entities/progress.entity';

import { DashboardOverviewDto } from './dto/dashboard-overview.dto';
import {
  RevenueAnalyticsDto,
  MonthlyRevenueDto,
} from './dto/revenue-analytics.dto';
import {
  UserStatisticsDto,
  UserGrowthDto,
  UserRoleDistributionDto,
} from './dto/user-statistics.dto';
import {
  CoursePerformanceDto,
  CoursePerformanceItemDto,
  CategoryPerformanceDto,
} from './dto/course-performance.dto';
import {
  EnrollmentTrendsDto,
  MonthlyEnrollmentDto,
  EnrollmentStatusDto,
} from './dto/enrollment-trends.dto';
import {
  RecentActivitiesDto,
  RecentActivityDto,
} from './dto/recent-activities.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(ResultExam)
    private readonly resultExamRepository: Repository<ResultExam>,
    @InjectRepository(ProgressTracking)
    private readonly progressRepository: Repository<ProgressTracking>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async getDashboardOverview(): Promise<DashboardOverviewDto> {
    const cacheKey = 'dashboard_overview';
    const cached = await this.cacheManager.get<DashboardOverviewDto>(cacheKey);

    if (cached) {
      return cached;
    }

    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Get total counts
    const totalUsers = await this.userRepository.count();
    const totalCourses = await this.courseRepository.count();
    const totalEnrollments = await this.enrollmentRepository.count();
    const activeCourses = await this.courseRepository.count({
      where: { status: CourseStatus.PUBLISHED },
    });

    // Get monthly counts
    const newUsersThisMonth = await this.userRepository.count({
      where: { createdAt: Between(currentMonth, now) },
    });
    const newUsersLastMonth = await this.userRepository.count({
      where: { createdAt: Between(lastMonth, currentMonth) },
    });

    const newCoursesThisMonth = await this.courseRepository.count({
      where: { createdAt: Between(currentMonth, now) },
    });
    const newCoursesLastMonth = await this.courseRepository.count({
      where: { createdAt: Between(lastMonth, currentMonth) },
    });

    const newEnrollmentsThisMonth = await this.enrollmentRepository.count({
      where: { enroll_at: Between(currentMonth, now) },
    });
    const newEnrollmentsLastMonth = await this.enrollmentRepository.count({
      where: { enroll_at: Between(lastMonth, currentMonth) },
    });

    // Calculate revenue (assuming course price * paid enrollments)
    const paidEnrollments = await this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.course', 'course')
      .where('enrollment.status = :status', { status: 'paid' })
      .getMany();

    const totalRevenue = paidEnrollments.reduce((sum, enrollment) => {
      return sum + (enrollment.course?.price || 0);
    }, 0);

    const revenueThisMonth = paidEnrollments
      .filter((enrollment) => enrollment.enroll_at >= currentMonth)
      .reduce((sum, enrollment) => {
        return sum + (enrollment.course?.price || 0);
      }, 0);

    const revenueLastMonth = paidEnrollments
      .filter(
        (enrollment) =>
          enrollment.enroll_at >= lastMonth &&
          enrollment.enroll_at < currentMonth,
      )
      .reduce((sum, enrollment) => {
        return sum + (enrollment.course?.price || 0);
      }, 0);

    // Calculate completion rate
    const completedProgress = await this.progressRepository.count({
      where: { is_completed: true },
    });
    const totalProgress = await this.progressRepository.count();
    const completionRate =
      totalProgress > 0 ? (completedProgress / totalProgress) * 100 : 0;

    // Calculate growth percentages
    const userGrowthPercentage =
      newUsersLastMonth > 0
        ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100
        : 0;

    const courseGrowthPercentage =
      newCoursesLastMonth > 0
        ? ((newCoursesThisMonth - newCoursesLastMonth) / newCoursesLastMonth) *
          100
        : 0;

    const enrollmentGrowthPercentage =
      newEnrollmentsLastMonth > 0
        ? ((newEnrollmentsThisMonth - newEnrollmentsLastMonth) /
            newEnrollmentsLastMonth) *
          100
        : 0;

    const revenueGrowthPercentage =
      revenueLastMonth > 0
        ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
        : 0;

    const overview: DashboardOverviewDto = {
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalRevenue,
      newUsersThisMonth,
      newCoursesThisMonth,
      newEnrollmentsThisMonth,
      revenueThisMonth,
      userGrowthPercentage: Math.round(userGrowthPercentage * 100) / 100,
      courseGrowthPercentage: Math.round(courseGrowthPercentage * 100) / 100,
      enrollmentGrowthPercentage:
        Math.round(enrollmentGrowthPercentage * 100) / 100,
      revenueGrowthPercentage: Math.round(revenueGrowthPercentage * 100) / 100,
      activeCourses,
      completionRate: Math.round(completionRate * 100) / 100,
    };

    await this.cacheManager.set(cacheKey, overview, 300000); // Cache for 5 minutes
    return overview;
  }

  async getRevenueAnalytics(): Promise<RevenueAnalyticsDto> {
    const cacheKey = 'revenue_analytics';
    const cached = await this.cacheManager.get<RevenueAnalyticsDto>(cacheKey);

    if (cached) {
      return cached;
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const monthlyRevenue: MonthlyRevenueDto[] = [];

    // Get monthly revenue for the current year
    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(currentYear, month, 1);
      const monthEnd = new Date(currentYear, month + 1, 0);

      const enrollments = await this.enrollmentRepository
        .createQueryBuilder('enrollment')
        .leftJoinAndSelect('enrollment.course', 'course')
        .where('enrollment.status = :status', { status: 'paid' })
        .andWhere('enrollment.enroll_at BETWEEN :start AND :end', {
          start: monthStart,
          end: monthEnd,
        })
        .getMany();

      const revenue = enrollments.reduce((sum, enrollment) => {
        return sum + (enrollment.course?.price || 0);
      }, 0);

      monthlyRevenue.push({
        month: new Date(currentYear, month, 1).toLocaleString('default', {
          month: 'long',
        }),
        revenue,
        orders: enrollments.length,
        year: currentYear,
      });
    }

    const totalRevenue = monthlyRevenue.reduce(
      (sum, month) => sum + month.revenue,
      0,
    );
    const averageMonthlyRevenue = totalRevenue / 12;

    const sortedByRevenue = [...monthlyRevenue].sort(
      (a, b) => b.revenue - a.revenue,
    );
    const highestRevenueMonth = sortedByRevenue[0]?.month || 'N/A';
    const lowestRevenueMonth = sortedByRevenue[11]?.month || 'N/A';

    // Calculate growth from last year (simplified)
    const lastYearRevenue = totalRevenue * 0.85; // Mock calculation
    const revenueGrowthPercentage =
      lastYearRevenue > 0
        ? ((totalRevenue - lastYearRevenue) / lastYearRevenue) * 100
        : 0;

    const totalPaidEnrollments = await this.enrollmentRepository.count({
      where: { status: 'PAID' },
    });

    const averageOrderValue =
      totalPaidEnrollments > 0 ? totalRevenue / totalPaidEnrollments : 0;

    const analytics: RevenueAnalyticsDto = {
      monthlyRevenue,
      totalRevenue,
      averageMonthlyRevenue: Math.round(averageMonthlyRevenue * 100) / 100,
      highestRevenueMonth,
      lowestRevenueMonth,
      revenueGrowthPercentage: Math.round(revenueGrowthPercentage * 100) / 100,
      totalPaidEnrollments,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
    };

    await this.cacheManager.set(cacheKey, analytics, 300000);
    return analytics;
  }

  async getUserStatistics(): Promise<UserStatisticsDto> {
    const cacheKey = 'user_statistics';
    const cached = await this.cacheManager.get<UserStatisticsDto>(cacheKey);

    if (cached) {
      return cached;
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const userGrowth: UserGrowthDto[] = [];

    // Get user growth by month
    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(currentYear, month, 1);
      const monthEnd = new Date(currentYear, month + 1, 0);

      const newUsers = await this.userRepository.count({
        where: { createdAt: Between(monthStart, monthEnd) },
      });

      const totalUsers = await this.userRepository.count({
        where: { createdAt: Between(new Date(currentYear, 0, 1), monthEnd) },
      });

      userGrowth.push({
        month: new Date(currentYear, month, 1).toLocaleString('default', {
          month: 'long',
        }),
        newUsers,
        totalUsers,
        year: currentYear,
      });
    }

    // Get role distribution
    const roleDistribution: UserRoleDistributionDto[] = [];
    const roles = ['student', 'instructor', 'admin'];
    const totalUsers = await this.userRepository.count();

    for (const role of roles) {
      const count = await this.userRepository.count({ where: { role } });
      const percentage = totalUsers > 0 ? (count / totalUsers) * 100 : 0;

      roleDistribution.push({
        role,
        count,
        percentage: Math.round(percentage * 100) / 100,
      });
    }

    const totalActiveUsers = await this.userRepository.count({
      where: { isBan: false },
    });

    const totalBannedUsers = await this.userRepository.count({
      where: { isBan: true },
    });

    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const newUsersThisMonth = await this.userRepository.count({
      where: { createdAt: Between(currentMonth, now) },
    });

    const newUsersLastMonth = await this.userRepository.count({
      where: { createdAt: Between(lastMonth, currentMonth) },
    });

    const userGrowthPercentage =
      newUsersLastMonth > 0
        ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100
        : 0;

    const totalNewUsers = userGrowth.reduce(
      (sum, month) => sum + month.newUsers,
      0,
    );
    const averageUsersPerMonth = totalNewUsers / 12;

    const statistics: UserStatisticsDto = {
      userGrowth,
      roleDistribution,
      totalActiveUsers,
      totalBannedUsers,
      newUsersThisMonth,
      newUsersLastMonth,
      userGrowthPercentage: Math.round(userGrowthPercentage * 100) / 100,
      averageUsersPerMonth: Math.round(averageUsersPerMonth * 100) / 100,
    };

    await this.cacheManager.set(cacheKey, statistics, 300000);
    return statistics;
  }

  async getCoursePerformance(): Promise<CoursePerformanceDto> {
    const cacheKey = 'course_performance';
    const cached = await this.cacheManager.get<CoursePerformanceDto>(cacheKey);

    if (cached) {
      return cached;
    }

    // Get top courses with enrollment counts
    const topCoursesData = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.category', 'category')
      .leftJoin('course.enrollments', 'enrollment')
      .addSelect('COUNT(enrollment.enrollmentId)', 'enrollmentCount')
      .groupBy('course.courseId')
      .addGroupBy('category.categoryId')
      .orderBy('COUNT(enrollment.enrollmentId)', 'DESC')
      .limit(10)
      .getRawAndEntities();

    const topCourses: CoursePerformanceItemDto[] = [];

    for (const course of topCoursesData.entities) {
      const enrollments = await this.enrollmentRepository.count({
        where: { course: { courseId: course.courseId } },
      });

      const paidEnrollments = await this.enrollmentRepository.count({
        where: {
          course: { courseId: course.courseId },
          status: 'PAID',
        },
      });

      const completedProgress = await this.progressRepository
        .createQueryBuilder('progress')
        .leftJoin('progress.lesson', 'lesson')
        .leftJoin('lesson.course', 'course')
        .where('course.courseId = :courseId', { courseId: course.courseId })
        .andWhere('progress.is_completed = :isCompleted', { isCompleted: true })
        .getCount();

      const totalProgress = await this.progressRepository
        .createQueryBuilder('progress')
        .leftJoin('progress.lesson', 'lesson')
        .leftJoin('lesson.course', 'course')
        .where('course.courseId = :courseId', { courseId: course.courseId })
        .getCount();

      const completionRate =
        totalProgress > 0 ? (completedProgress / totalProgress) * 100 : 0;
      const revenue = paidEnrollments * course.price;

      topCourses.push({
        courseId: course.courseId,
        title: course.title,
        enrollments,
        completionRate: Math.round(completionRate * 100) / 100,
        averageRating: course.rating,
        revenue,
        category: course.category?.name || 'Uncategorized',
        isActive: course.status,
        lessonCount: 0, // You might want to add lesson count to course entity
        duration: course.duration,
      });
    }

    // Get category performance
    const categories = await this.categoryRepository.find();
    const categoryPerformance: CategoryPerformanceDto[] = [];

    for (const category of categories) {
      const courses = await this.courseRepository.find({
        where: { category: { categoryId: category.categoryId } },
      });

      const courseCount = courses.length;
      let totalEnrollments = 0;
      let totalRevenue = 0;
      let totalCompletionRate = 0;

      for (const course of courses) {
        const enrollments = await this.enrollmentRepository.count({
          where: { course: { courseId: course.courseId } },
        });

        const paidEnrollments = await this.enrollmentRepository.count({
          where: {
            course: { courseId: course.courseId },
            status: 'PAID',
          },
        });

        const completedProgress = await this.progressRepository
          .createQueryBuilder('progress')
          .leftJoin('progress.lesson', 'lesson')
          .leftJoin('lesson.course', 'course')
          .where('course.courseId = :courseId', { courseId: course.courseId })
          .andWhere('progress.is_completed = :isCompleted', {
            isCompleted: true,
          })
          .getCount();

        const totalProgress = await this.progressRepository
          .createQueryBuilder('progress')
          .leftJoin('progress.lesson', 'lesson')
          .leftJoin('lesson.course', 'course')
          .where('course.courseId = :courseId', { courseId: course.courseId })
          .getCount();

        const completionRate =
          totalProgress > 0 ? (completedProgress / totalProgress) * 100 : 0;

        totalEnrollments += enrollments;
        totalRevenue += paidEnrollments * course.price;
        totalCompletionRate += completionRate;
      }

      const averageCompletionRate =
        courseCount > 0 ? totalCompletionRate / courseCount : 0;

      categoryPerformance.push({
        categoryName: category.name,
        courseCount,
        totalEnrollments,
        averageCompletionRate: Math.round(averageCompletionRate * 100) / 100,
        totalRevenue,
      });
    }

    const totalCourses = await this.courseRepository.count();
    const activeCourses = await this.courseRepository.count({
      where: { status: CourseStatus.PUBLISHED },
    });

    const allCompletedProgress = await this.progressRepository.count({
      where: { is_completed: true },
    });
    const allTotalProgress = await this.progressRepository.count();
    const averageCompletionRate =
      allTotalProgress > 0
        ? (allCompletedProgress / allTotalProgress) * 100
        : 0;

    const mostPopularCategory =
      categoryPerformance.length > 0
        ? categoryPerformance.reduce((prev, current) =>
            prev.totalEnrollments > current.totalEnrollments ? prev : current,
          ).categoryName
        : 'N/A';

    const allCourses = await this.courseRepository.find();
    const averageRating =
      allCourses.length > 0
        ? allCourses.reduce((sum, course) => sum + course.rating, 0) /
          allCourses.length
        : 0;

    const performance: CoursePerformanceDto = {
      topCourses,
      categoryPerformance,
      totalCourses,
      activeCourses,
      averageCompletionRate: Math.round(averageCompletionRate * 100) / 100,
      mostPopularCategory,
      averageRating: Math.round(averageRating * 100) / 100,
    };

    await this.cacheManager.set(cacheKey, performance, 300000);
    return performance;
  }

  async getEnrollmentTrends(): Promise<EnrollmentTrendsDto> {
    const cacheKey = 'enrollment_trends';
    const cached = await this.cacheManager.get<EnrollmentTrendsDto>(cacheKey);

    if (cached) {
      return cached;
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const monthlyTrends: MonthlyEnrollmentDto[] = [];

    // Get monthly enrollment trends
    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(currentYear, month, 1);
      const monthEnd = new Date(currentYear, month + 1, 0);

      const totalEnrollments = await this.enrollmentRepository.count({
        where: { enroll_at: Between(monthStart, monthEnd) },
      });

      const paidEnrollments = await this.enrollmentRepository.count({
        where: {
          enroll_at: Between(monthStart, monthEnd),
          status: 'PAID',
        },
      });

      const freeEnrollments = totalEnrollments - paidEnrollments;

      // Calculate completion rate for this month
      const completedInMonth = await this.progressRepository
        .createQueryBuilder('progress')
        .leftJoin('progress.user', 'user')
        .leftJoin('progress.lesson', 'lesson')
        .leftJoin('lesson.course', 'course')
        .leftJoin('user.enrollments', 'enrollment')
        .where('enrollment.course = course.courseId')
        .andWhere('enrollment.enroll_at BETWEEN :start AND :end', {
          start: monthStart,
          end: monthEnd,
        })
        .andWhere('progress.is_completed = true')
        .getCount();

      const totalProgressInMonth = await this.progressRepository
        .createQueryBuilder('progress')
        .leftJoin('progress.user', 'user')
        .leftJoin('progress.lesson', 'lesson')
        .leftJoin('lesson.course', 'course')
        .leftJoin('user.enrollments', 'enrollment')
        .where('enrollment.course = course.courseId')
        .andWhere('enrollment.enroll_at BETWEEN :start AND :end', {
          start: monthStart,
          end: monthEnd,
        })
        .getCount();

      const completionRate =
        totalProgressInMonth > 0
          ? (completedInMonth / totalProgressInMonth) * 100
          : 0;

      monthlyTrends.push({
        month: new Date(currentYear, month, 1).toLocaleString('default', {
          month: 'long',
        }),
        enrollments: totalEnrollments,
        paidEnrollments,
        freeEnrollments,
        completionRate: Math.round(completionRate * 100) / 100,
        year: currentYear,
      });
    }

    // Get enrollment status distribution
    const statusDistribution: EnrollmentStatusDto[] = [];
    const statuses = ['PAID', 'PENDING', 'CANCELLED'];
    const totalEnrollments = await this.enrollmentRepository.count();

    for (const status of statuses) {
      const count = await this.enrollmentRepository.count({
        where: { status },
      });
      const percentage =
        totalEnrollments > 0 ? (count / totalEnrollments) * 100 : 0;

      statusDistribution.push({
        status,
        count,
        percentage: Math.round(percentage * 100) / 100,
      });
    }

    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const enrollmentsThisMonth = await this.enrollmentRepository.count({
      where: { enroll_at: Between(currentMonth, now) },
    });

    const enrollmentsLastMonth = await this.enrollmentRepository.count({
      where: { enroll_at: Between(lastMonth, currentMonth) },
    });

    const enrollmentGrowthPercentage =
      enrollmentsLastMonth > 0
        ? ((enrollmentsThisMonth - enrollmentsLastMonth) /
            enrollmentsLastMonth) *
          100
        : 0;

    const totalYearlyEnrollments = monthlyTrends.reduce(
      (sum, month) => sum + month.enrollments,
      0,
    );
    const averageEnrollmentsPerMonth = totalYearlyEnrollments / 12;

    const peakEnrollmentMonth = monthlyTrends.reduce((prev, current) =>
      prev.enrollments > current.enrollments ? prev : current,
    ).month;

    // Calculate conversion rate (paid vs total)
    const paidEnrollmentsThisMonth = await this.enrollmentRepository.count({
      where: {
        enroll_at: Between(currentMonth, now),
        status: 'PAID',
      },
    });

    const conversionRate =
      enrollmentsThisMonth > 0
        ? (paidEnrollmentsThisMonth / enrollmentsThisMonth) * 100
        : 0;

    const trends: EnrollmentTrendsDto = {
      monthlyTrends,
      statusDistribution,
      totalEnrollments,
      enrollmentsThisMonth,
      enrollmentsLastMonth,
      enrollmentGrowthPercentage:
        Math.round(enrollmentGrowthPercentage * 100) / 100,
      averageEnrollmentsPerMonth:
        Math.round(averageEnrollmentsPerMonth * 100) / 100,
      peakEnrollmentMonth,
      conversionRate: Math.round(conversionRate * 100) / 100,
    };

    await this.cacheManager.set(cacheKey, trends, 300000);
    return trends;
  }

  async getRecentActivities(limit: number = 50): Promise<RecentActivitiesDto> {
    const cacheKey = `recent_activities_${limit}`;
    const cached = await this.cacheManager.get<RecentActivitiesDto>(cacheKey);

    if (cached) {
      return cached;
    }

    const activities: RecentActivityDto[] = [];
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get recent enrollments
    const recentEnrollments = await this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.user', 'user')
      .leftJoinAndSelect('enrollment.course', 'course')
      .orderBy('enrollment.enroll_at', 'DESC')
      .limit(limit / 2)
      .getMany();

    for (const enrollment of recentEnrollments) {
      activities.push({
        id: `enrollment_${enrollment.enrollmentId}`,
        type: 'enrollment',
        description: `${enrollment.user.username} enrolled in ${enrollment.course.title}`,
        userName: enrollment.user.username,
        userId: enrollment.user.user_id,
        courseTitle: enrollment.course.title,
        courseId: enrollment.course.courseId,
        timestamp: enrollment.enroll_at,
        metadata: {
          status: enrollment.status,
          price: enrollment.course.price,
        },
      });
    }

    // Get recent user registrations
    const recentUsers = await this.userRepository
      .createQueryBuilder('user')
      .orderBy('user.createdAt', 'DESC')
      .limit(limit / 4)
      .getMany();

    for (const user of recentUsers) {
      activities.push({
        id: `user_registered_${user.user_id}`,
        type: 'user_registered',
        description: `${user.username} registered as ${user.role}`,
        userName: user.username,
        userId: user.user_id,
        timestamp: user.createdAt,
        metadata: {
          role: user.role,
          email: user.email,
        },
      });
    }

    // Get recent courses
    const recentCourses = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.instructor', 'instructor')
      .orderBy('course.createdAt', 'DESC')
      .limit(limit / 4)
      .getMany();

    for (const course of recentCourses) {
      activities.push({
        id: `course_created_${course.courseId}`,
        type: 'course_created',
        description: `${course.instructor.username} created course "${course.title}"`,
        userName: course.instructor.username,
        userId: course.instructor.user_id,
        courseTitle: course.title,
        courseId: course.courseId,
        timestamp: course.createdAt,
        metadata: {
          price: course.price,
          category: course.category?.name,
        },
      });
    }

    // Sort activities by timestamp
    activities.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    // Limit results
    const limitedActivities = activities.slice(0, limit);

    const last24HoursCount = activities.filter(
      (activity) => new Date(activity.timestamp) >= last24Hours,
    ).length;

    const lastWeekCount = activities.filter(
      (activity) => new Date(activity.timestamp) >= lastWeek,
    ).length;

    // Calculate most active hour (simplified)
    const hourCounts = new Array(24).fill(0);
    activities.forEach((activity) => {
      const hour = new Date(activity.timestamp).getHours();
      hourCounts[hour]++;
    });

    const mostActiveHourIndex = hourCounts.indexOf(Math.max(...hourCounts));
    const mostActiveHour = `${mostActiveHourIndex.toString().padStart(2, '0')}:00-${(mostActiveHourIndex + 1).toString().padStart(2, '0')}:00`;

    // Calculate most frequent activity type
    const activityTypeCounts = activities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      return acc;
    }, {});

    const mostFrequentActivityType = Object.entries(activityTypeCounts).reduce(
      (a, b) => (a[1] > b[1] ? a : b),
    )[0];

    const recentActivities: RecentActivitiesDto = {
      activities: limitedActivities,
      totalCount: activities.length,
      last24Hours: last24HoursCount,
      lastWeek: lastWeekCount,
      mostActiveHour,
      mostFrequentActivityType,
    };

    await this.cacheManager.set(cacheKey, recentActivities, 60000); // Cache for 1 minute
    return recentActivities;
  }

  async clearDashboardCache(): Promise<void> {
    const cacheKeys = [
      'dashboard_overview',
      'revenue_analytics',
      'user_statistics',
      'course_performance',
      'enrollment_trends',
    ];

    for (const key of cacheKeys) {
      await this.cacheManager.del(key);
    }

    // Clear recent activities cache for common limits
    const limits = [20, 50, 100];
    for (const limit of limits) {
      await this.cacheManager.del(`recent_activities_${limit}`);
    }
  }
}
