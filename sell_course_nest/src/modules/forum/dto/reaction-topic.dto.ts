import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ReactionType {
  LIKE = 'like',
  LOVE = 'love',
  HAHA = 'haha',
  WOW = 'wow',
  SAD = 'sad',
  ANGRY = 'angry',
}

export class CreateReactionTopicDto {
  @ApiProperty({
    description: 'ID của user thực hiện reaction',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'ID của forum mà reaction áp dụng',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsNotEmpty()
  @IsUUID()
  forumId: string;

  @ApiProperty({
    description: 'Loại reaction',
    enum: ReactionType,
    example: ReactionType.LIKE,
  })
  @IsNotEmpty()
  @IsEnum(ReactionType)
  reactionType: string;
}
