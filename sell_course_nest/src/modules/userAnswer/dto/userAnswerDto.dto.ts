import { ApiProperty } from '@nestjs/swagger';

// src/dto/user-answer.dto.ts
export class UserAnswerDto {
  @ApiProperty({
    description: '{ questionId: string; answer: string }[] ',
    example: '{ questionId: string; answer: string }[]',
  })
  answers: { questionId: string; answer: string }[];

  @ApiProperty({ description: 'User ID', example: 'user-12345' })
  userId: string;
}
