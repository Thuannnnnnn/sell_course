import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Get,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat_support.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../Auth/roles.guard';
import {
  CreateOrGetChatSessionDto,
  ChatSessionResponseDto,
} from './dto/chat-session.dto';

@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}
  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('session')
  @ApiOperation({
    summary: 'Tạo hoặc lấy session chat',
    description:
      'Kiểm tra session hiện tại, nếu còn hạn thì load messages cũ, nếu hết hạn hoặc không có thì tạo mới',
  })
  @ApiResponse({
    status: 200,
    description: 'Session và messages',
    type: ChatSessionResponseDto,
  })
  @ApiBody({ type: CreateOrGetChatSessionDto })
  async createOrGetChatSession(@Body() body: CreateOrGetChatSessionDto) {
    try {
      const result = await this.chatService.createOrGetChatSession(
        body.userId,
        body.sessionId,
      );
      return {
        sessionId: result.sessionId,
        messages: result.messages, // Messages đã được format từ Redis
        isNewSession: result.isNewSession,
      };
    } catch {
      throw new HttpException(
        'Không thể tạo hoặc lấy session chat',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post()
  async createChatSession(@Body() body: { userId: string }) {
    const session = await this.chatService.createChatSession(body.userId);
    return { sessionId: session.id };
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
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

  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('history')
  @ApiOperation({
    summary: 'Lấy lịch sử chat của người dùng',
    description: 'Trả về lịch sử các phiên chat và tin nhắn của người dùng',
  })
  @ApiResponse({
    status: 200,
    description: 'Lịch sử chat của người dùng',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy lịch sử chat' })
  async getChatHistory(@Body() body: { userId: string }) {
    try {
      const history = await this.chatService.getChatHistory(body.userId);
      if (!history.length) {
        throw new HttpException(
          'Không tìm thấy lịch sử chat',
          HttpStatus.NOT_FOUND,
        );
      }
      return history;
    } catch {
      throw new HttpException(
        'Không thể lấy lịch sử chat',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('history/:sessionId')
  @ApiOperation({
    summary: 'Lấy lịch sử chat của một session',
    description: 'Trả về lịch sử chat và tin nhắn của một session cụ thể',
  })
  @ApiResponse({
    status: 200,
    description: 'Lịch sử chat của session',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy session' })
  async getSessionChatHistory(
    @Body() body: any,
    @Param('sessionId') sessionId: string,
  ) {
    try {
      const result = await this.chatService.getSessionChatHistory(sessionId);
      if (!result) {
        throw new HttpException('Không tìm thấy session', HttpStatus.NOT_FOUND);
      }
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Không thể lấy lịch sử chat của session',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete(':sessionId')
  async deleteChatSession(@Param('sessionId') sessionId: string) {
    await this.chatService.deleteChatSession(sessionId);
    return { success: true };
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete('user/:userId/except/:sessionId')
  async deleteOldSessionsOfUser(
    @Param('userId') userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    await this.chatService.deleteOldSessionsOfUser(userId, sessionId);
    return { success: true };
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('deactivate/:sessionId')
  async deactivateSession(@Param('sessionId') sessionId: string) {
    await this.chatService.deactivateSession(sessionId);
    return { success: true };
  }
}
