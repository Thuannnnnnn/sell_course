import { IsNotEmpty, IsUUID, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDiscussionDto {
  @ApiProperty({
    description: 'ID của user viết bình luận',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'ID của forum mà bình luận áp dụng',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsNotEmpty()
  @IsUUID()
  forumId: string;

  @ApiProperty({
    description: 'Nội dung bình luận',
    example: 'This is a great topic!',
  })
  @IsNotEmpty()
  @IsString()
  content: string;
}

export class UpdateDiscussionDto {
  @ApiProperty({
    description: 'Nội dung bình luận mới',
    example: 'Updated: This is an even better topic!',
    required: false,
  })
  @IsOptional()
  @IsString()
  content?: string;
}
