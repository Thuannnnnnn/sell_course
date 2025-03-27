import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty } from 'class-validator';

export class InteractionRequestDTO {
  @ApiProperty({ description: 'ID of the student', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  UserId: string;

  @ApiProperty({ description: 'ID of the course', example: 2 })
  @IsNumber()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({ description: 'Interest score of the student', example: 5 })
  @IsNumber()
  interest_score: number;
}
