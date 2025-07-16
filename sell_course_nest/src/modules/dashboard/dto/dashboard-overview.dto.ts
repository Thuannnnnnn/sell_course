import { ApiProperty } from '@nestjs/swagger';

export class DashboardOverviewDto {
  @ApiProperty({
    description: 'Total number of users',
    example: 1250,
  })
  totalUsers: number;

  @ApiProperty({
    description: 'Total number of courses',
    example: 85,
  })
  totalCourses: number;

  @ApiProperty({
    description: 'Total number of enrollments',
    example: 3420,
  })
  totalEnrollments: number;

  @ApiProperty({
    description: 'Total revenue in USD',
    example: 125000,
  })
  totalRevenue: number;

  @ApiProperty({
    description: 'New users this month',
    example: 156,
  })
  newUsersThisMonth: number;

  @ApiProperty({
    description: 'New courses this month',
    example: 12,
  })
  newCoursesThisMonth: number;

  @ApiProperty({
    description: 'New enrollments this month',
    example: 320,
  })
  newEnrollmentsThisMonth: number;

  @ApiProperty({
    description: 'Revenue this month',
    example: 15000,
  })
  revenueThisMonth: number;

  @ApiProperty({
    description: 'Growth percentage for users',
    example: 12.5,
  })
  userGrowthPercentage: number;

  @ApiProperty({
    description: 'Growth percentage for courses',
    example: 8.3,
  })
  courseGrowthPercentage: number;

  @ApiProperty({
    description: 'Growth percentage for enrollments',
    example: 24.1,
  })
  enrollmentGrowthPercentage: number;

  @ApiProperty({
    description: 'Growth percentage for revenue',
    example: 18.7,
  })
  revenueGrowthPercentage: number;

  @ApiProperty({
    description: 'Active courses count',
    example: 78,
  })
  activeCourses: number;

  @ApiProperty({
    description: 'Completion rate percentage',
    example: 65.2,
  })
  completionRate: number;
}