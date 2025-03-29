import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatSession } from './entities/chat-session.entity';
import { Message } from './entities/message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatSession)
    private chatSessionRepository: Repository<ChatSession>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async createChatSession(userId: string): Promise<ChatSession> {
    const session = this.chatSessionRepository.create({
      userId,
      startTime: new Date(),
    });
    return await this.chatSessionRepository.save(session);
  }
  async getActiveSessions(): Promise<ChatSession[]> {
    return this.chatSessionRepository.find({
      where: { isActive: true },
      order: { startTime: 'DESC' },
    });
  }
  async getChatHistory(
    userId: string,
  ): Promise<{ session: ChatSession; messages: Message[] }[]> {
    const sessions = await this.chatSessionRepository.find({
      where: { userId },
      order: { startTime: 'DESC' },
    });

    const history = [];
    for (const session of sessions) {
      const messages = await this.messageRepository.find({
        where: { sessionId: session.id },
        order: { timestamp: 'ASC' },
      });
      history.push({ session, messages });
    }

    return history;
  }
}
