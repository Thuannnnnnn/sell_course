import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatSession } from './entities/chat-session.entity';
import { Message } from './entities/message.entity';
import { NotificationService } from '../notification/notification.service';
import { User } from '../user/entities/user.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatSession)
    private chatSessionRepository: Repository<ChatSession>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private notificationService: NotificationService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // Thời gian tồn tại session: 2 giờ (milliseconds)
  private readonly SESSION_DURATION = 2 * 60 * 60 * 1000;

  // Helper methods for Redis keys
  private getSessionMessagesKey(sessionId: string): string {
    return `chat:session:${sessionId}:messages`;
  }

  async createOrGetChatSession(
    userId: string,
    sessionId?: string,
  ): Promise<{ sessionId: string; messages: any[]; isNewSession: boolean }> {
    let session: ChatSession;
    let messages: any[] = [];
    let isNewSession = false;

    // Nếu có sessionId, kiểm tra session có tồn tại và còn hạn không
    if (sessionId) {
      session = await this.chatSessionRepository.findOne({
        where: { id: sessionId, user: { user_id: userId } },
      });

      if (session) {
        const now = new Date();
        const sessionAge = now.getTime() - session.startTime.getTime();

        // Nếu session còn hạn (< 2h), load messages từ Redis
        if (sessionAge < this.SESSION_DURATION) {
          const messagesKey = this.getSessionMessagesKey(sessionId);
          const cachedMessages =
            await this.cacheManager.get<any[]>(messagesKey);
          messages = cachedMessages || [];
          return { sessionId: session.id, messages, isNewSession: false };
        } else {
          // Session hết hạn, xóa messages cũ từ Redis và cập nhật session
          const messagesKey = this.getSessionMessagesKey(sessionId);
          await this.cacheManager.del(messagesKey);

          session.startTime = new Date();
          session.isActive = true;
          session.endTime = null;
          await this.chatSessionRepository.save(session);
          isNewSession = true;
          return { sessionId: session.id, messages: [], isNewSession };
        }
      }
    }

    // Tạo session mới nếu không có sessionId hoặc session không tồn tại
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });

    session = this.chatSessionRepository.create({
      user: { user_id: userId },
      startTime: new Date(),
      isActive: true,
    });

    const savedSession = await this.chatSessionRepository.save(session);

    // Send chat session notification
    try {
      await this.notificationService.notifyChatSessionCreated(
        userId,
        user?.username || 'Unknown user',
        savedSession.id,
      );
    } catch (error) {
      console.error('Failed to send chat session notification:', error);
    }

    return { sessionId: savedSession.id, messages: [], isNewSession: true };
  }

  async createChatSession(userId: string): Promise<ChatSession> {
    // Get user info for notification
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });

    const session = this.chatSessionRepository.create({
      user: { user_id: userId },
      startTime: new Date(),
    });

    const savedSession = await this.chatSessionRepository.save(session);

    // Send chat session notification
    try {
      await this.notificationService.notifyChatSessionCreated(
        userId,
        user?.username || 'Unknown user',
        savedSession.id,
      );
    } catch (error) {
      console.error('Failed to send chat session notification:', error);
    }

    return savedSession;
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
  ): Promise<{ session: ChatSession; messages: any[] }[]> {
    const sessions = await this.chatSessionRepository.find({
      where: { user: { user_id: userId } },
      order: { startTime: 'DESC' },
    });

    const history = [];
    for (const session of sessions) {
      const messagesKey = this.getSessionMessagesKey(session.id);
      const messages = (await this.cacheManager.get<any[]>(messagesKey)) || [];
      history.push({ session, messages });
    }

    return history;
  }

  // Thêm hàm mới lấy lịch sử chat theo sessionId
  async getSessionChatHistory(
    sessionId: string,
  ): Promise<{ session: ChatSession; messages: any[] } | null> {
    const session = await this.chatSessionRepository.findOne({
      where: { id: sessionId },
    });
    if (!session) return null;

    const messagesKey = this.getSessionMessagesKey(sessionId);
    const messages = (await this.cacheManager.get<any[]>(messagesKey)) || [];
    return { session, messages };
  }

  // Thêm hàm xóa ChatSession và toàn bộ message liên quan
  async deleteChatSession(sessionId: string): Promise<void> {
    // Xóa tất cả message từ Redis
    const messagesKey = this.getSessionMessagesKey(sessionId);
    await this.cacheManager.del(messagesKey);
    // Xóa session từ DB
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

  // Thêm method để lưu message vào Redis
  async saveMessageToRedis(sessionId: string, message: any): Promise<void> {
    const messagesKey = this.getSessionMessagesKey(sessionId);
    const messages = (await this.cacheManager.get<any[]>(messagesKey)) || [];
    messages.push(message);
    // Lưu với TTL 2 giờ (7200 seconds)
    await this.cacheManager.set(messagesKey, messages, 7200);
  }

  // Thêm method để lấy messages từ Redis
  async getMessagesFromRedis(sessionId: string): Promise<any[]> {
    const messagesKey = this.getSessionMessagesKey(sessionId);
    return (await this.cacheManager.get<any[]>(messagesKey)) || [];
  }

  async deactivateSession(sessionId: string): Promise<void> {
    await this.chatSessionRepository.update(
      { id: sessionId },
      { isActive: false },
    );
  }
}
