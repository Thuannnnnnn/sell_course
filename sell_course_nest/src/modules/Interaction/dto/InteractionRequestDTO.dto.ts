import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsEnum } from 'class-validator';
import { InteractionType } from '../entities/Interaction.entity';

export class InteractionRequestDTO {
  @ApiProperty({ description: 'ID of the student', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'ID of the course', example: 2 })
  @IsNumber()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({
    description: 'Interaction type of the student',
    example: InteractionType.VIEW,
  })
  @IsEnum(InteractionType)
  interaction_type: InteractionType;
}
