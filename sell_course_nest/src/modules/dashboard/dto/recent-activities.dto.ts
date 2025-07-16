import { ApiProperty } from '@nestjs/swagger';

export class RecentActivityDto {
  @ApiProperty({
    description: 'Activity ID',
    example: 'uuid-activity-id',
  })
  id: string;

  @ApiProperty({
    description: 'Activity type',
    example: 'enrollment',
    enum: ['enrollment', 'course_created', 'user_registered', 'forum_post', 'course_completed', 'payment_received'],
  })
  type: string;

  @ApiProperty({
    description: 'Activity description',
    example: 'John Doe enrolled in React Fundamentals',
  })
  description: string;

  @ApiProperty({
    description: 'User who performed the activity',
    example: 'John Doe',
  })
  userName: string;

  @ApiProperty({
    description: 'User ID',
    example: 'uuid-user-id',
  })
  userId: string;

  @ApiProperty({
    description: 'Related course title (if applicable)',
    example: 'React Fundamentals',
  })
  courseTitle?: string;

  @ApiProperty({
    description: 'Related course ID (if applicable)',
    example: 'uuid-course-id',
  })
  courseId?: string;

  @ApiProperty({
    description: 'Activity timestamp',
    example: '2024-01-15T14:30:00Z',
  })
  timestamp: Date;

  @ApiProperty({
    description: 'Activity metadata',
    example: { amount: 99.99, currency: 'USD' },
  })
  metadata?: Record<string, any>;
}

export class RecentActivitiesDto {
  @ApiProperty({
    description: 'Recent activities list',
    type: [RecentActivityDto],
  })
  activities: RecentActivityDto[];

  @ApiProperty({
    description: 'Total activities count',
    example: 1250,
  })
  totalCount: number;

  @ApiProperty({
    description: 'Activities from last 24 hours',
    example: 45,
  })
  last24Hours: number;

  @ApiProperty({
    description: 'Activities from last week',
    example: 280,
  })
  lastWeek: number;

  @ApiProperty({
    description: 'Most active hour of the day',
    example: '14:00-15:00',
  })
  mostActiveHour: string;

  @ApiProperty({
    description: 'Most frequent activity type',
    example: 'enrollment',
  })
  mostFrequentActivityType: string;
}