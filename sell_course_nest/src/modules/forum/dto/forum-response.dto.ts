import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsDateString } from 'class-validator';
import { User } from '../../user/entities/user.entity'; // Import entity User

export class ReactionTopicDto {
  @ApiProperty({
    description: 'ID của reaction',
    example: '9b0f2288-05e3-4e18-a54b-8bd97f5ecb5f',
  })
  @IsUUID()
  reactionId: string;

  @ApiProperty({
    description: 'Loại reaction',
    example: 'like',
  })
  @IsString()
  reactionType: string;

  @ApiProperty({
    description: 'Thời gian tạo reaction',
    example: '2025-03-05T21:04:22.762Z',
  })
  @IsDateString()
  createdAt: string;
}

export class DiscussionDto {
  @ApiProperty({
    description: 'ID của bình luận',
    example: 'b09199a1-8fc8-417a-8f2a-e3bb8e204129',
  })
  @IsUUID()
  discussionId: string;

  @ApiProperty({
    description: 'Nội dung bình luận',
    example: 'This is a great topic!',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Thời gian tạo bình luận',
    example: '2025-03-05T21:05:50.242Z',
  })
  @IsDateString()
  createdAt: string;
}

export class ForumResponseDto {
  @ApiProperty({
    description: 'ID của forum',
    example: '4b998075-c104-4e0f-bd2c-a5a16ff04d67',
  })
  @IsUUID()
  forumId: string;

  @ApiProperty({
    description: 'Tiêu đề của forum',
    example: 'How to use NestJS',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'URL hình ảnh của forum',
    example:
      'https://sdnmma.blob.core.windows.net/wdp/953bcf98-e31c-4f2c-94dd-c0a49990e3c6-OIP%20(1).jpg',
  })
  @IsString()
  image: string;

  @ApiProperty({
    description: 'Nội dung của forum',
    example: 'This is a discussion about NestJS.',
  })
  @IsString()
  text: string;

  @ApiProperty({
    description: 'Thời gian tạo forum',
    example: '2025-03-03T21:37:03.920Z',
  })
  @IsDateString()
  createdAt: string;

  @ApiProperty({
    description: 'Thông tin user tạo forum',
    type: User, // Thêm user vào DTO
  })
  user: User;

  @ApiProperty({
    description: 'Danh sách các reaction của forum',
    type: [ReactionTopicDto],
  })
  reactionTopics: ReactionTopicDto[];

  @ApiProperty({
    description: 'Danh sách các bình luận của forum',
    type: [DiscussionDto],
  })
  discussions: DiscussionDto[];
}
