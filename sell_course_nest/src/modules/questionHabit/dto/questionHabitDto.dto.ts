import { ApiProperty } from '@nestjs/swagger';

export class QuestionHabitDto {
  @ApiProperty({
    description: 'Question text',
    example: 'What is your favorite subject?',
  })
  question: string;
}
