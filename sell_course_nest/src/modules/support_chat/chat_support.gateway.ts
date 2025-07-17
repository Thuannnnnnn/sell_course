import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Server } from 'socket.io';
import { UserService } from '../user/user.service';
interface ChatSession {
  id: string;
  isActive: boolean;
  createdAt: Date;
  startTime?: string;
  endTime?: string | null;
  user?: {
    user_id: string;
    username?: string;
  };
}
const SESSION_TTL = 86400;
const getSessionInfoKey = (sessionId: string) =>
  `chat:session:${sessionId}:info`;
const getSessionMessagesKey = (sessionId: string) =>
  `chat:session:${sessionId}:messages`;

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly userService: UserService,
  ) {}

  // Helper: Lấy thông tin user từ database
  private async getUserInfo(
    userId: string,
  ): Promise<{ user_id: string; username: string } | null> {
    try {
      const user = await this.userService.getUser(userId);
      if (user) {
        return {
          user_id: user.user_id,
          username: user.username || user.email || `User ${userId.slice(-4)}`,
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  // Helper: Transform session data for frontend
  private transformSessionForFrontend(session: ChatSession): any {
    return {
      id: session.id,
      isActive: session.isActive,
      startTime: session.startTime || session.createdAt.toISOString(),
      endTime: session.endTime,
      user: session.user || {
        user_id: session.id,
        username: `Guest ${session.id.slice(-4)}`, // Fallback cho guest
      },
    };
  }

  // Helper: Lấy toàn bộ session từ Redis
  private async getAllSessions(): Promise<any[]> {
    try {
      const sessionsList =
        (await this.cacheManager.get<string[]>('chat:sessions:list')) || [];
      const sessions: any[] = [];
      for (const sessionId of sessionsList) {
        const sessionKey = getSessionInfoKey(sessionId);
        const session = await this.cacheManager.get<ChatSession>(sessionKey);
        if (session) {
          if (session.user?.user_id) {
            const userInfo = await this.getUserInfo(session.user.user_id);
            if (userInfo) {
              session.user = userInfo;
              await this.cacheManager.set(sessionKey, session, SESSION_TTL);
            }
          }
          sessions.push(this.transformSessionForFrontend(session));
        }
      }
      return sessions;
    } catch {
      return [];
    }
  }

  // Helper: Thêm sessionId vào danh sách sessions
  private async addSessionToList(sessionId: string): Promise<void> {
    try {
      const sessionsList =
        (await this.cacheManager.get<string[]>('chat:sessions:list')) || [];
      if (!sessionsList.includes(sessionId)) {
        sessionsList.push(sessionId);
        await this.cacheManager.set(
          'chat:sessions:list',
          sessionsList,
          SESSION_TTL,
        );
      }
    } catch {
      // Ignore errors
    }
  }

  // Helper: Xóa sessionId khỏi danh sách sessions
  private async removeSessionFromList(sessionId: string): Promise<void> {
    try {
      const sessionsList =
        (await this.cacheManager.get<string[]>('chat:sessions:list')) || [];
      const updatedList = sessionsList.filter((id) => id !== sessionId);
      await this.cacheManager.set(
        'chat:sessions:list',
        updatedList,
        SESSION_TTL,
      );
    } catch {
      // Ignore errors
    }
  }

  async handleDisconnect(client: Socket & { sessionId?: string }) {
    const sessionId = client.sessionId;
    if (!sessionId) {
      return;
    }

    const sessionKey = getSessionInfoKey(sessionId);
    try {
      const session = await this.cacheManager.get<ChatSession>(sessionKey);
      if (session) {
        session.isActive = false;
        session.endTime = new Date().toISOString();

        await this.cacheManager.set(sessionKey, session, SESSION_TTL);

        this.server.emit(
          'sessionUpdated',
          this.transformSessionForFrontend(session),
        );

        const allSessions = await this.getAllSessions();
        this.server.emit('sessionsList', allSessions);
      }
    } catch {
      // Ignore errors
    }
  }

  async handleConnection(client: Socket & { sessionId?: string }) {
    const sessionId = client.handshake.query.sessionId as string;
    const userId = client.handshake.query.userId as string;

    if (!sessionId) {
      const allSessions = await this.getAllSessions();
      client.emit('sessionsList', allSessions);
      return;
    }

    client.sessionId = sessionId;
    client.join(sessionId);

    const sessionKey = getSessionInfoKey(sessionId);
    try {
      const existingSession =
        await this.cacheManager.get<ChatSession>(sessionKey);
      if (existingSession) {
        existingSession.isActive = true;
        existingSession.endTime = null;
        if (userId) {
          const userInfo = await this.getUserInfo(userId);
          if (userInfo) {
            existingSession.user = userInfo;
          }
        }
        await this.cacheManager.set(sessionKey, existingSession, SESSION_TTL);
        const messagesKey = getSessionMessagesKey(sessionId);
        const messages =
          (await this.cacheManager.get<any[]>(messagesKey)) || [];
        if (messages.length > 0) {
          const transformedMessages = messages.map((msg) => ({
            id: msg.id,
            sessionId: msg.sessionId || msg.chatSessionId,
            senderId: msg.senderId,
            messageText: msg.messageText,
            timestamp:
              typeof msg.timestamp === 'string'
                ? msg.timestamp
                : msg.timestamp.toISOString(),
          }));
          client.emit('history', transformedMessages);
        }
      }
    } catch {
      // Ignore errors
    }
  }
  @SubscribeMessage('getAllSessions')
  async handleGetAllSessions(client: Socket) {
    const allSessions = await this.getAllSessions();
    client.emit('sessionsList', allSessions);
  }

  @SubscribeMessage('join')
  handleJoin(client: Socket, data: { sessionId: string }) {
    client.join(data.sessionId);
  }

  @SubscribeMessage('leave')
  handleLeave(client: Socket, data: { sessionId: string }) {
    client.leave(data.sessionId);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    client: Socket,
    data: { sessionId: string; message: string; sender: string },
  ) {
    const sessionKey = getSessionInfoKey(data.sessionId);
    let chatSession = await this.cacheManager.get<ChatSession>(sessionKey);

    if (!chatSession) {
      const userInfo = data.sender ? await this.getUserInfo(data.sender) : null;
      const now = new Date();
      chatSession = {
        id: data.sessionId,
        isActive: true,
        createdAt: now,
        startTime: now.toISOString(),
        endTime: null,
        user: userInfo || {
          user_id: data.sender || data.sessionId,
          username: `Guest ${data.sessionId.slice(-4)}`,
        },
      };

      await this.cacheManager.set(sessionKey, chatSession, SESSION_TTL);
      await this.addSessionToList(data.sessionId);

      const transformedSession = this.transformSessionForFrontend(chatSession);
      this.server.emit('newSession', transformedSession);

      const allSessions = await this.getAllSessions();
      this.server.emit('sessionsList', allSessions);
    }

    const message = {
      id: `${Date.now()}-${Math.random()}`,
      sessionId: data.sessionId,
      senderId: data.sender,
      messageText: data.message,
      timestamp: new Date().toISOString(),
    };

    const messagesKey = getSessionMessagesKey(data.sessionId);
    try {
      const messages = (await this.cacheManager.get<any[]>(messagesKey)) || [];
      messages.push(message);

      await this.cacheManager.set(messagesKey, messages, SESSION_TTL);
      await this.cacheManager.set(sessionKey, chatSession, SESSION_TTL);
    } catch {
      // Ignore errors
    }

    this.server.to(data.sessionId).emit('message', message);
  }

  @SubscribeMessage('getHistory')
  async handleGetHistory(client: Socket, sessionId: string) {
    const messagesKey = getSessionMessagesKey(sessionId);
    const messages = (await this.cacheManager.get<any[]>(messagesKey)) || [];

    if (messages.length === 0) {
      client.emit('history', []);
      return;
    }

    const transformedMessages = messages.map((msg) => ({
      id: msg.id,
      sessionId: msg.sessionId || msg.chatSessionId,
      senderId: msg.senderId,
      messageText: msg.messageText,
      timestamp:
        typeof msg.timestamp === 'string'
          ? msg.timestamp
          : msg.timestamp.toISOString(),
    }));

    client.emit('history', transformedMessages);
  }
}
