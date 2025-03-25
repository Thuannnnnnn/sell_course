import { Controller, Post, Body } from '@nestjs/common';
import { ChatService } from './chat_support.service';

@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async createChatSession(@Body() body: { userId: string }) {
    const session = await this.chatService.createChatSession(body.userId);
    return { sessionId: session.id };
  }
}
