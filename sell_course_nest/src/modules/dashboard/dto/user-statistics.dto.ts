import { ApiProperty } from '@nestjs/swagger';

export class UserGrowthDto {
  @ApiProperty({
    description: 'Month name',
    example: 'January',
  })
  month: string;

  @ApiProperty({
    description: 'Number of new users',
    example: 125,
  })
  newUsers: number;

  @ApiProperty({
    description: 'Total users up to this month',
    example: 1250,
  })
  totalUsers: number;

  @ApiProperty({
    description: 'Year',
    example: 2024,
  })
  year: number;
}

export class UserRoleDistributionDto {
  @ApiProperty({
    description: 'Role name',
    example: 'student',
  })
  role: string;

  @ApiProperty({
    description: 'Number of users with this role',
    example: 1150,
  })
  count: number;

  @ApiProperty({
    description: 'Percentage of total users',
    example: 92.0,
  })
  percentage: number;
}

export class UserStatisticsDto {
  @ApiProperty({
    description: 'User growth data by month',
    type: [UserGrowthDto],
  })
  userGrowth: UserGrowthDto[];

  @ApiProperty({
    description: 'User distribution by role',
    type: [UserRoleDistributionDto],
  })
  roleDistribution: UserRoleDistributionDto[];

  @ApiProperty({
    description: 'Total active users',
    example: 1180,
  })
  totalActiveUsers: number;

  @ApiProperty({
    description: 'Total banned users',
    example: 15,
  })
  totalBannedUsers: number;

  @ApiProperty({
    description: 'New users this month',
    example: 156,
  })
  newUsersThisMonth: number;

  @ApiProperty({
    description: 'New users last month',
    example: 132,
  })
  newUsersLastMonth: number;

  @ApiProperty({
    description: 'User growth percentage',
    example: 18.18,
  })
  userGrowthPercentage: number;

  @ApiProperty({
    description: 'Average users per month',
    example: 104.17,
  })
  averageUsersPerMonth: number;
}