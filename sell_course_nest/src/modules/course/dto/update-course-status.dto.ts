import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { CourseStatus } from '../enums/course-status.enum';

export class UpdateCourseStatusDto {
  @ApiProperty({
    description:
      'New course status - can only change between DRAFT and PENDING_REVIEW for course creators',
    example: CourseStatus.PENDING_REVIEW,
    enum: [CourseStatus.DRAFT, CourseStatus.PENDING_REVIEW],
  })
  @IsEnum([CourseStatus.DRAFT, CourseStatus.PENDING_REVIEW], {
    message: 'Status can only be DRAFT or PENDING_REVIEW for course creators',
  })
  status: CourseStatus.DRAFT | CourseStatus.PENDING_REVIEW;
}

export class ReviewCourseStatusDto {
  @ApiProperty({
    description: 'Review decision - can be PUBLISHED or REJECTED by admins',
    example: CourseStatus.PUBLISHED,
    enum: [CourseStatus.PUBLISHED, CourseStatus.REJECTED],
  })
  @IsEnum([CourseStatus.PUBLISHED, CourseStatus.REJECTED], {
    message: 'Review status can only be PUBLISHED or REJECTED',
  })
  status: CourseStatus.PUBLISHED | CourseStatus.REJECTED;

  @ApiProperty({
    description: 'Optional reason for rejection',
    example: 'Content quality needs improvement',
    required: false,
  })
  reason?: string;
}
