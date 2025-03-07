import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateReactionQaDto {
  @ApiProperty({
    description: 'ID of the User',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'ID of the QA Study',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  qaStudyId: string;

  @ApiProperty({
    description: 'Reaction type',
    enum: ['like', 'love', 'haha', 'wow', 'sad', 'angry'],
    example: 'like',
  })
  @IsEnum(['like', 'love', 'haha', 'wow', 'sad', 'angry'])
  reactionType: string;
}
