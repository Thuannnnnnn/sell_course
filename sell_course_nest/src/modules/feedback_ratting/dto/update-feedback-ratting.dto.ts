import { IsInt, IsString, Min, Max, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFeedbackRattingDto {
  @ApiProperty({
    description: 'Star rating (1-5)',
    example: 4,
    required: false,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  star?: number;

  @ApiProperty({
    description: 'Feedback text',
    example: 'Updated feedback: Great course!',
    required: false,
  })
  @IsString()
  @IsOptional()
  feedback?: string;
}
