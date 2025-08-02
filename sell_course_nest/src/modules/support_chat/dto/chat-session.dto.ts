import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateOrGetChatSessionDto {
  @ApiProperty({
    description: 'ID của người dùng',
    example: 'user-123',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'ID của session hiện tại (nếu có)',
    example: 'session-456',
    required: false,
  })
  @IsOptional()
  @IsString()
  sessionId?: string;
}

export class ChatSessionResponseDto {
  @ApiProperty({
    description: 'ID của session chat',
    example: 'session-456',
  })
  sessionId: string;

  @ApiProperty({
    description: 'Danh sách tin nhắn trong session',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'msg-123' },
        sessionId: { type: 'string', example: 'session-456' },
        sender: { type: 'string', example: 'user-123' },
        messageText: { type: 'string', example: 'Hello' },
        timestamp: { type: 'string', example: '2025-01-30T10:00:00.000Z' },
      },
    },
  })
  messages: Array<{
    id: string;
    sessionId: string;
    sender: string;
    messageText: string;
    timestamp: string;
  }>;

  @ApiProperty({
    description: 'Có phải session mới tạo hay không',
    example: true,
  })
  isNewSession: boolean;
}
