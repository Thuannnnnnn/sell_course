import { ApiProperty } from '@nestjs/swagger';

export class MonthlyRevenueDto {
  @ApiProperty({
    description: 'Month name',
    example: 'January',
  })
  month: string;

  @ApiProperty({
    description: 'Revenue amount',
    example: 15000,
  })
  revenue: number;

  @ApiProperty({
    description: 'Number of orders',
    example: 120,
  })
  orders: number;

  @ApiProperty({
    description: 'Year',
    example: 2024,
  })
  year: number;
}

export class RevenueAnalyticsDto {
  @ApiProperty({
    description: 'Monthly revenue data',
    type: [MonthlyRevenueDto],
  })
  monthlyRevenue: MonthlyRevenueDto[];

  @ApiProperty({
    description: 'Total revenue',
    example: 125000,
  })
  totalRevenue: number;

  @ApiProperty({
    description: 'Average monthly revenue',
    example: 10416.67,
  })
  averageMonthlyRevenue: number;

  @ApiProperty({
    description: 'Highest revenue month',
    example: 'December',
  })
  highestRevenueMonth: string;

  @ApiProperty({
    description: 'Lowest revenue month',
    example: 'February',
  })
  lowestRevenueMonth: string;

  @ApiProperty({
    description: 'Revenue growth percentage',
    example: 15.2,
  })
  revenueGrowthPercentage: number;

  @ApiProperty({
    description: 'Total paid enrollments',
    example: 2850,
  })
  totalPaidEnrollments: number;

  @ApiProperty({
    description: 'Average order value',
    example: 43.86,
  })
  averageOrderValue: number;
}