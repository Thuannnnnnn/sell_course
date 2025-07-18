import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatSession } from './entities/chat-session.entity';
import { Message } from './entities/message.entity';
import { ChatService } from './chat_support.service';
import { ChatController } from './chat_support.controller';
import { ChatGateway } from './chat_support.gateway';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { Permission } from '../permission/entities/permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChatSession, Message, User, Permission])],
  providers: [ChatService, ChatGateway, UserService],
  controllers: [ChatController],
})
export class SupportChatModule {}
