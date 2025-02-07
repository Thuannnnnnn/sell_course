import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, IsUUID } from 'class-validator';

export class CourseResponseDTO {
  constructor(
    courseId: string,
    title: string,
    price: number,
    description: string,
    videoInfo: string,
    imageInfo: string,
    createdAt: Date,
    updatedAt: Date,
    userId: string,
    userName: string,
    categoryName: string,
    categoryId: string,
  ) {
    this.courseId = courseId;
    this.title = title;
    this.price = price;
    this.description = description;
    this.videoInfo = videoInfo;
    this.imageInfo = imageInfo;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.userId = userId;
    this.userName = userName;
    this.categoryName = categoryName;
    this.categoryId = categoryId;
  }

  @ApiProperty({
    description: 'Unique identifier for the course',
    example: '1234-5678-91011',
  })
  @IsUUID()
  courseId: string;

  @ApiProperty({
    description: 'Title of the course',
    example: 'Introduction to NestJS',
  })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Price of the course in USD', example: 29.99 })
  @IsNumber()
  price: number;

  @ApiProperty({
    description: 'A brief description of the course',
    example:
      'This course introduces you to NestJS, a powerful Node.js framework.',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Information related to the course video',
    example: 'This course has 10 hours of content.',
  })
  @IsString()
  videoInfo: string;

  @ApiProperty({
    description: 'Information related to the course image',
    example: 'https://example.com/course-image.jpg',
  })
  @IsString()
  imageInfo: string;

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
    description: 'Name of the user who created the course',
    example: 'John Doe',
  })
  @IsString()
  userName: string;

  @ApiProperty({
    description: 'The category name of the course',
    example: 'Web Development',
  })
  @IsString()
  categoryName: string;

  @ApiProperty({
    description: 'The ID of the category to which the course belongs',
    example: 'xyz-9876-mnop-5432',
  })
  @IsUUID()
  categoryId: string;
}
