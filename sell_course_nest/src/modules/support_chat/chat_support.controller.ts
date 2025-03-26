import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { ChatService } from './chat_support.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async createChatSession(@Body() body: { userId: string }) {
    const session = await this.chatService.createChatSession(body.userId);
    return { sessionId: session.id };
  }
  @Get('active-sessions')
  @ApiOperation({
    summary: 'Lấy tất cả phiên hỗ trợ đang hoạt động',
    description: 'Trả về danh sách các phiên hỗ trợ đang hoạt động',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách phiên hỗ trợ đang hoạt động',
  })
  @ApiResponse({ status: 500, description: 'Lỗi máy chủ nội bộ' })
  async getActiveSessions() {
    try {
      const activeSessions = await this.chatService.getActiveSessions();
      return activeSessions;
    } catch {
      throw new HttpException(
        'Không thể lấy phiên hỗ trợ đang hoạt động',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
