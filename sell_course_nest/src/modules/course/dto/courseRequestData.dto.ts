import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsUUID,
  IsOptional,
  IsBoolean,
  IsInt,
} from 'class-validator';
import { Express } from 'express';

export class CourseRequestDTO {
  @ApiProperty({
    description: 'Title of the course',
    example: 'NestJS Mastery',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Brief course summary',
    example: 'Learn NestJS basics',
  })
  @IsString()
  short_description: string;

  @ApiProperty({
    description: 'Full description of the course',
    example: 'This is a detailed course on NestJS.',
  })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Course duration in minutes', example: 120 })
  @IsInt()
  duration: number;

  @ApiProperty({ description: 'Price of the course in USD', example: 49.99 })
  @IsNumber()
  price: number;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Introductory video file',
  })
  @IsOptional()
  videoIntro?: Express.Multer.File;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Thumbnail image file',
  })
  @IsOptional()
  thumbnail?: Express.Multer.File;

  @ApiProperty({ description: 'Skill required or taught', example: 'Beginner' })
  @IsString()
  skill: string;

  @ApiProperty({ description: 'Course level', example: 'Beginner' })
  @IsString()
  level: string;

  @ApiProperty({ description: 'Course visibility status', example: true })
  @IsBoolean()
  status: boolean;

  @ApiProperty({ description: 'Instructor ID', example: 'uuid-1234-5678' })
  @IsUUID()
  instructorId: string;

  @ApiProperty({ description: 'Category ID', example: 'uuid-8765-4321' })
  @IsUUID()
  categoryId: string;
}
