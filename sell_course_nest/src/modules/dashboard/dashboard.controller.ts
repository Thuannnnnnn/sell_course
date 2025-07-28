import {
  Controller,
  Get,
  Query,
  Post,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { DashboardOverviewDto } from './dto/dashboard-overview.dto';
import { RevenueAnalyticsDto } from './dto/revenue-analytics.dto';
import { UserStatisticsDto } from './dto/user-statistics.dto';
import { CoursePerformanceDto } from './dto/course-performance.dto';
import { EnrollmentTrendsDto } from './dto/enrollment-trends.dto';
import { RecentActivitiesDto } from './dto/recent-activities.dto';
import { Roles } from '../Auth/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../Auth/roles.guard';
import { UserRole } from '../Auth/user.enum';

@ApiTags('Dashboard')
@Controller('api/dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiBearerAuth('Authorization')
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('overview')
  @ApiOperation({
    summary: 'Get dashboard overview',
    description:
      'Retrieve comprehensive dashboard overview including KPIs, growth metrics, and key statistics',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard overview retrieved successfully',
    type: DashboardOverviewDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getDashboardOverview(): Promise<DashboardOverviewDto> {
    return this.dashboardService.getDashboardOverview();
  }

  @ApiBearerAuth('Authorization')
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('revenue-analytics')
  @ApiOperation({
    summary: 'Get revenue analytics',
    description:
      'Retrieve detailed revenue analytics including monthly trends, growth rates, and financial KPIs',
  })
  @ApiResponse({
    status: 200,
    description: 'Revenue analytics retrieved successfully',
    type: RevenueAnalyticsDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getRevenueAnalytics(): Promise<RevenueAnalyticsDto> {
    return this.dashboardService.getRevenueAnalytics();
  }
  @ApiBearerAuth('Authorization')
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('user-statistics')
  @ApiOperation({
    summary: 'Get user statistics',
    description:
      'Retrieve user statistics including growth trends, role distribution, and user activity metrics',
  })
  @ApiResponse({
    status: 200,
    description: 'User statistics retrieved successfully',
    type: UserStatisticsDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getUserStatistics(): Promise<UserStatisticsDto> {
    return this.dashboardService.getUserStatistics();
  }
  @ApiBearerAuth('Authorization')
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('course-performance')
  @ApiOperation({
    summary: 'Get course performance analytics',
    description:
      'Retrieve course performance metrics including top courses, category analysis, and completion rates',
  })
  @ApiResponse({
    status: 200,
    description: 'Course performance analytics retrieved successfully',
    type: CoursePerformanceDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getCoursePerformance(): Promise<CoursePerformanceDto> {
    return this.dashboardService.getCoursePerformance();
  }
  @ApiBearerAuth('Authorization')
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('enrollment-trends')
  @ApiOperation({
    summary: 'Get enrollment trends',
    description:
      'Retrieve enrollment trends including monthly patterns, status distribution, and conversion rates',
  })
  @ApiResponse({
    status: 200,
    description: 'Enrollment trends retrieved successfully',
    type: EnrollmentTrendsDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getEnrollmentTrends(): Promise<EnrollmentTrendsDto> {
    return this.dashboardService.getEnrollmentTrends();
  }
  @ApiBearerAuth('Authorization')
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('recent-activities')
  @ApiOperation({
    summary: 'Get recent activities',
    description:
      'Retrieve recent system activities including enrollments, user registrations, and course creations',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of activities to retrieve (default: 50, max: 100)',
    example: 50,
  })
  @ApiResponse({
    status: 200,
    description: 'Recent activities retrieved successfully',
    type: RecentActivitiesDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid limit parameter',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getRecentActivities(
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 50,
  ): Promise<RecentActivitiesDto> {
    // Validate limit
    if (limit < 1 || limit > 100) {
      limit = 50;
    }

    return this.dashboardService.getRecentActivities(limit);
  }
  @ApiBearerAuth('Authorization')
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('clear-cache')
  @ApiOperation({
    summary: 'Clear dashboard cache',
    description:
      'Clear all cached dashboard data to force fresh data retrieval',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard cache cleared successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Dashboard cache cleared successfully',
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-15T10:30:00Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async clearDashboardCache(): Promise<{ message: string; timestamp: string }> {
    await this.dashboardService.clearDashboardCache();
    return {
      message: 'Dashboard cache cleared successfully',
      timestamp: new Date().toISOString(),
    };
  }
  @ApiBearerAuth('Authorization')
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('health')
  @ApiOperation({
    summary: 'Dashboard health check',
    description: 'Check dashboard service health and connectivity',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard service is healthy',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          example: 'healthy',
        },
        service: {
          type: 'string',
          example: 'dashboard',
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-15T10:30:00Z',
        },
        uptime: {
          type: 'string',
          example: '5 hours 30 minutes',
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Dashboard service is unhealthy',
  })
  async healthCheck(): Promise<{
    status: string;
    service: string;
    timestamp: string;
    uptime: string;
  }> {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);

    return {
      status: 'healthy',
      service: 'dashboard',
      timestamp: new Date().toISOString(),
      uptime: `${hours} hours ${minutes} minutes`,
    };
  }
}
