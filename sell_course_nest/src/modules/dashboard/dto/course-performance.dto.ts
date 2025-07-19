import { ApiProperty } from '@nestjs/swagger';
import { CourseStatus } from '../../course/enums/course-status.enum';

export class CoursePerformanceItemDto {
  @ApiProperty({
    description: 'Course ID',
    example: 'uuid-course-id',
  })
  courseId: string;

  @ApiProperty({
    description: 'Course title',
    example: 'Complete React Development Course',
  })
  title: string;

  @ApiProperty({
    description: 'Number of enrollments',
    example: 245,
  })
  enrollments: number;

  @ApiProperty({
    description: 'Completion rate percentage',
    example: 78.5,
  })
  completionRate: number;

  @ApiProperty({
    description: 'Average rating',
    example: 4.5,
  })
  averageRating: number;

  @ApiProperty({
    description: 'Total revenue from this course',
    example: 12250,
  })
  revenue: number;

  @ApiProperty({
    description: 'Course category',
    example: 'Programming',
  })
  category: string;

  @ApiProperty({
    description: 'Course status',
    example: CourseStatus.PUBLISHED,
    enum: CourseStatus,
  })
  isActive: CourseStatus;

  @ApiProperty({
    description: 'Number of lessons',
    example: 25,
  })
  lessonCount: number;

  @ApiProperty({
    description: 'Course duration in hours',
    example: 40,
  })
  duration: number;
}

export class CategoryPerformanceDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Programming',
  })
  categoryName: string;

  @ApiProperty({
    description: 'Number of courses in category',
    example: 15,
  })
  courseCount: number;

  @ApiProperty({
    description: 'Total enrollments in category',
    example: 1250,
  })
  totalEnrollments: number;

  @ApiProperty({
    description: 'Average completion rate',
    example: 72.3,
  })
  averageCompletionRate: number;

  @ApiProperty({
    description: 'Total revenue from category',
    example: 45000,
  })
  totalRevenue: number;
}

export class CoursePerformanceDto {
  @ApiProperty({
    description: 'Top performing courses',
    type: [CoursePerformanceItemDto],
  })
  topCourses: CoursePerformanceItemDto[];

  @ApiProperty({
    description: 'Performance by category',
    type: [CategoryPerformanceDto],
  })
  categoryPerformance: CategoryPerformanceDto[];

  @ApiProperty({
    description: 'Total courses',
    example: 85,
  })
  totalCourses: number;

  @ApiProperty({
    description: 'Active courses',
    example: 78,
  })
  activeCourses: number;

  @ApiProperty({
    description: 'Average course completion rate',
    example: 65.2,
  })
  averageCompletionRate: number;

  @ApiProperty({
    description: 'Most popular category',
    example: 'Programming',
  })
  mostPopularCategory: string;

  @ApiProperty({
    description: 'Average course rating',
    example: 4.2,
  })
  averageRating: number;
}
