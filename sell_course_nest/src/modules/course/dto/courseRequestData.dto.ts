import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsDateString,
  IsUUID,
  IsOptional,
} from 'class-validator';
import { Express } from 'express';
export class CourseRequestDTO {
  @ApiProperty({
    description: 'Title of the course',
    example: 'Introduction to NestJS',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Price of the course in USD',
    example: 29.99,
  })
  @IsNumber()
  price: number;

  @ApiProperty({
    description: 'A brief description of the course',
    example:
      'This course introduces you to NestJS, a powerful Node.js framework.',
  })
  @IsString()
  description: string;

  @ApiProperty({ type: 'string', format: 'binary', description: 'Video file' })
  @IsOptional()
  videoInfo?: Express.Multer.File;

  @ApiProperty({ type: 'string', format: 'binary', description: 'Image file' })
  @IsOptional()
  imageInfo?: Express.Multer.File;

  @ApiProperty({
    description: 'The date when the course was created',
    example: '2025-01-14T12:00:00.000Z',
  })
  @IsDateString()
  createdAt: Date;

  @ApiProperty({
    description: 'The date when the course was last updated',
    example: '2025-01-14T12:00:00.000Z',
  })
  @IsDateString()
  updatedAt: Date;

  @ApiProperty({
    description: 'The ID of the user who created the course',
    example: 'abcd-1234-efgh-5678',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'The ID of the category to which the course belongs',
    example: 'xyz-9876-mnop-5432',
  })
  @IsUUID()
  categoryId: string;
}
