import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ResponseQaDto {
  @ApiProperty({
    example: '987e6543-e21b-11d3-a456-426614174001',
    description: 'QA ID',
  })
  qaId: string;

  @ApiProperty({ example: 'user@example.com', description: 'User Email' })
  userEmail: string;

  @ApiProperty({ example: 'John Doe', description: 'Username' })
  username: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Course ID',
  })
  courseId: string;

  @ApiProperty({
    example: 'What is the difference between TypeScript and JavaScript?',
    description: 'QA Text',
  })
  text: string;

  @ApiPropertyOptional({
    example: 'parent-qa-id-123',
    description: 'Parent QA ID',
  })
  parentId?: string;

  @ApiProperty({ example: '2023-10-05T12:00:00Z', description: 'Created At' })
  createdAt: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'User Avatar Image',
  })
  avatarImg?: string;
}
