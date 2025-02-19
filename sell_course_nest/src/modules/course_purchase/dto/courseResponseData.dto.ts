import { ApiProperty } from '@nestjs/swagger';

export class CoursePurchasedDTO {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email of the user who purchased the course',
  })
  email: string;

  @ApiProperty({
    example: 'purchase-123',
    description: 'Unique ID of the course purchase',
  })
  coursePurchaseId: string;

  @ApiProperty({
    example: 'course-456',
    description: 'ID of the purchased course',
  })
  courseId: string;

  @ApiProperty({
    example: 'Advanced TypeScript',
    description: 'Title of the purchased course',
  })
  title: string;

  @ApiProperty({
    example: 'Programming',
    description: 'Category name of the course',
  })
  categoryName: string;

  @ApiProperty({ example: 'cat-789', description: 'Category ID of the course' })
  categoryId: string;

  @ApiProperty({
    example: 'https://example.com/course-image.jpg',
    description: 'Image URL of the course',
  })
  imageInfo: string;

  constructor(
    email: string,
    coursePurchaseId: string,
    courseId: string,
    title: string,
    categoryName = 'Unknown Category',
    categoryId = 'Unknown',
    imageInfo = '',
  ) {
    this.email = email;
    this.coursePurchaseId = coursePurchaseId;
    this.courseId = courseId;
    this.title = title;
    this.categoryName = categoryName;
    this.categoryId = categoryId;
    this.imageInfo = imageInfo;
  }
}
