import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatSession } from './entities/chat-session.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatSession)
    private chatSessionRepository: Repository<ChatSession>,
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
}
