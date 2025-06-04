import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsDateString,
  IsUUID,
  IsBoolean,
  IsInt,
} from 'class-validator';

export class CourseResponseDTO {
  constructor(
    courseId: string,
    title: string,
    short_description: string,
    description: string,
    duration: number,
    price: number,
    videoIntro: string,
    thumbnail: string,
    rating: number,
    skill: string,
    level: string,
    status: boolean,
    createdAt: Date,
    updatedAt: Date,
    instructorId: string,
    instructorName: string,
    instructorAvatar: string,
    categoryId: string,
    categoryName: string,
  ) {
    this.courseId = courseId;
    this.title = title;
    this.short_description = short_description;
    this.description = description;
    this.duration = duration;
    this.price = price;
    this.videoIntro = videoIntro;
    this.thumbnail = thumbnail;
    this.rating = rating;
    this.skill = skill;
    this.level = level;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.instructorId = instructorId;
    this.instructorName = instructorName;
    this.instructorAvatar = instructorAvatar;
    this.categoryId = categoryId;
    this.categoryName = categoryName;
  }

  @ApiProperty({ description: 'Course ID', example: 'uuid-1234' })
  @IsUUID()
  courseId: string;

  @ApiProperty({ description: 'Course title', example: 'NestJS Mastery' })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Short description',
    example: 'Learn NestJS basics',
  })
  @IsString()
  short_description: string;

  @ApiProperty({
    description: 'Full description',
    example: 'This course covers NestJS in depth.',
  })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Duration in minutes', example: 120 })
  @IsInt()
  duration: number;

  @ApiProperty({ description: 'Course price', example: 49.99 })
  @IsNumber()
  price: number;

  @ApiProperty({
    description: 'Video intro URL',
    example: 'https://cdn.com/intro.mp4',
  })
  @IsString()
  videoIntro: string;

  @ApiProperty({
    description: 'Course thumbnail URL',
    example: 'https://cdn.com/thumb.jpg',
  })
  @IsString()
  thumbnail: string;

  @ApiProperty({ description: 'Course rating (0–5)', example: 4 })
  @IsInt()
  rating: number;

  @ApiProperty({ description: 'Skill taught', example: 'JavaScript' })
  @IsString()
  skill: string;

  @ApiProperty({ description: 'Course level', example: 'Beginner' })
  @IsString()
  level: string;

  @ApiProperty({ description: 'Course public status', example: true })
  @IsBoolean()
  status: boolean;

  @ApiProperty({
    description: 'Creation date',
    example: '2025-06-01T00:00:00Z',
  })
  @IsDateString()
  createdAt: Date;

  @ApiProperty({ description: 'Last update', example: '2025-06-02T00:00:00Z' })
  @IsDateString()
  updatedAt: Date;

  @ApiProperty({ description: 'Instructor ID', example: 'uuid-5678' })
  @IsUUID()
  instructorId: string;

  @ApiProperty({ description: 'Instructor name', example: 'Jane Doe' })
  @IsString()
  instructorName: string;

  @ApiProperty({
    description: 'Instructor avatar URL',
    example: 'https://cdn.com/avatar.jpg',
  })
  @IsString()
  instructorAvatar: string;

  @ApiProperty({ description: 'Category ID', example: 'uuid-9999' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ description: 'Category name', example: 'Backend Development' })
  @IsString()
  categoryName: string;
}
