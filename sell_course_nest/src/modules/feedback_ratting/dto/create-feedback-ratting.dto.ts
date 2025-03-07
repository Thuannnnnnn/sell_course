import { IsInt, IsString, Min, Max, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFeedbackRattingDto {
  @ApiProperty({
    description: 'ID of the user providing feedback',
    example: 'user123',
  })
  @IsString()
  user_id: string;

  @ApiProperty({
    description: 'ID of the course being rated',
    example: 'course456',
  })
  @IsString()
  courseId: string;

  @ApiProperty({
    description: 'Star rating (1-5)',
    example: 4,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  star: number;

  @ApiProperty({
    description: 'Feedback text',
    example: 'Great course, very informative!',
    required: false,
  })
  @IsString()
  @IsOptional()
  feedback?: string;
}
