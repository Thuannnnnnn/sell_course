import { ApiProperty } from '@nestjs/swagger';

// src/dto/user-answer.dto.ts
export class UserAnswerDto {
  @ApiProperty({
    description: 'Question ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  questionId: string;

  @ApiProperty({ description: 'User answer', example: 'Mathematics' })
  answer: string;

  @ApiProperty({ description: 'User ID', example: 'user-12345' })
  userId: string;
}
