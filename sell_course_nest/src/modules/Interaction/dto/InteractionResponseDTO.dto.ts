import { ApiProperty } from '@nestjs/swagger';
import { InteractionType } from '../entities/Interaction.entity';

export class InteractionResponseDTO {
  @ApiProperty({ description: 'ID of the interaction', example: 'uuid-value' })
  id: string;

  @ApiProperty({ description: 'ID of the student', example: 1 })
  userId: string;

  @ApiProperty({ description: 'ID of the course', example: 2 })
  courseId: string;

  @ApiProperty({
    description: 'Interaction type of the student',
    example: InteractionType.VIEW,
  })
  interaction_type: InteractionType;
}
