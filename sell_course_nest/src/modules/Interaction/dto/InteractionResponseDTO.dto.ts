import { ApiProperty } from '@nestjs/swagger';

export class InteractionResponseDTO {
  @ApiProperty({ description: 'ID of the interaction', example: 1 })
  id: number;

  @ApiProperty({ description: 'ID of the student', example: 1 })
  UserId: string;

  @ApiProperty({ description: 'ID of the course', example: 2 })
  courseId: string;

  @ApiProperty({ description: 'Interest score of the student', example: 5 })
  interest_score: number;
}
