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
      user: { user_id: userId },
      startTime: new Date(),
    });
    return await this.chatSessionRepository.save(session);
  }
  async getActiveSessions(): Promise<ChatSession[]> {
    return this.chatSessionRepository.find({
      where: { isActive: true },
      order: { startTime: 'DESC' },
      relations: ['user'], // Thêm dòng này để trả về cả user
    });
  }
  async getChatHistory(
    userId: string,
  ): Promise<{ session: ChatSession; messages: Message[] }[]> {
    const sessions = await this.chatSessionRepository.find({
      where: { user: { user_id: userId } },
      relations: ['messages'],
      order: { startTime: 'DESC' },
    });

    const history = [];
    for (const session of sessions) {
      const messages = await this.messageRepository.find({
        where: { chatSession: { id: session.id } },
        order: { timestamp: 'ASC' },
      });
      history.push({ session, messages });
    }

    return history;
  }
  // Thêm hàm mới lấy lịch sử chat theo sessionId
  async getSessionChatHistory(
    sessionId: string,
  ): Promise<{ session: ChatSession; messages: Message[] } | null> {
    const session = await this.chatSessionRepository.findOne({
      where: { id: sessionId },
    });
    if (!session) return null;
    const messages = await this.messageRepository.find({
      where: { chatSession: { id: sessionId } },
      order: { timestamp: 'ASC' },
    });
    return { session, messages };
  }
  // Thêm hàm xóa ChatSession và toàn bộ message liên quan
  async deleteChatSession(sessionId: string): Promise<void> {
    // Xóa tất cả message thuộc session này
    await this.messageRepository.delete({ chatSession: { id: sessionId } });
    // Xóa session
    await this.chatSessionRepository.delete({ id: sessionId });
  }
  // Delete all old sessions of user (except the provided sessionId)
  async deleteOldSessionsOfUser(
    userId: string,
    exceptSessionId: string,
  ): Promise<void> {
    // Lấy tất cả session của user, trừ sessionId mới nhất
    const oldSessions = await this.chatSessionRepository.find({
      where: { user: { user_id: userId } },
    });
    for (const session of oldSessions) {
      if (session.id !== exceptSessionId) {
        await this.deleteChatSession(session.id);
      }
    }
  }

  async deactivateSession(sessionId: string): Promise<void> {
    await this.chatSessionRepository.update(
      { id: sessionId },
      { isActive: false },
    );
  }
}
