import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatSession } from './entities/chat-session.entity';
import { Message } from './entities/message.entity';
import { ChatService } from './chat_support.service';
import { ChatController } from './chat_support.controller';
import { ChatGateway } from './chat_support.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([ChatSession, Message])],
  providers: [ChatService, ChatGateway],
  controllers: [ChatController],
})
export class SupportChatModule {}
