import { ApiProperty } from '@nestjs/swagger';

export class MonthlyEnrollmentDto {
  @ApiProperty({
    description: 'Month name',
    example: 'January',
  })
  month: string;

  @ApiProperty({
    description: 'Number of enrollments',
    example: 245,
  })
  enrollments: number;

  @ApiProperty({
    description: 'Number of paid enrollments',
    example: 220,
  })
  paidEnrollments: number;

  @ApiProperty({
    description: 'Number of free enrollments',
    example: 25,
  })
  freeEnrollments: number;

  @ApiProperty({
    description: 'Completion rate for this month',
    example: 68.5,
  })
  completionRate: number;

  @ApiProperty({
    description: 'Year',
    example: 2024,
  })
  year: number;
}

export class EnrollmentStatusDto {
  @ApiProperty({
    description: 'Enrollment status',
    example: 'paid',
  })
  status: string;

  @ApiProperty({
    description: 'Number of enrollments with this status',
    example: 2850,
  })
  count: number;

  @ApiProperty({
    description: 'Percentage of total enrollments',
    example: 83.3,
  })
  percentage: number;
}

export class EnrollmentTrendsDto {
  @ApiProperty({
    description: 'Monthly enrollment trends',
    type: [MonthlyEnrollmentDto],
  })
  monthlyTrends: MonthlyEnrollmentDto[];

  @ApiProperty({
    description: 'Enrollment status distribution',
    type: [EnrollmentStatusDto],
  })
  statusDistribution: EnrollmentStatusDto[];

  @ApiProperty({
    description: 'Total enrollments',
    example: 3420,
  })
  totalEnrollments: number;

  @ApiProperty({
    description: 'Enrollments this month',
    example: 320,
  })
  enrollmentsThisMonth: number;

  @ApiProperty({
    description: 'Enrollments last month',
    example: 285,
  })
  enrollmentsLastMonth: number;

  @ApiProperty({
    description: 'Enrollment growth percentage',
    example: 12.28,
  })
  enrollmentGrowthPercentage: number;

  @ApiProperty({
    description: 'Average enrollments per month',
    example: 285,
  })
  averageEnrollmentsPerMonth: number;

  @ApiProperty({
    description: 'Peak enrollment month',
    example: 'September',
  })
  peakEnrollmentMonth: string;

  @ApiProperty({
    description: 'Current month conversion rate',
    example: 89.2,
  })
  conversionRate: number;
}