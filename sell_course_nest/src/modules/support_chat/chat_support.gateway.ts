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
import { ChatService } from './chat_support.service';
import { NotificationService } from '../notification/notification.service';
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
// TTL trong giây: 2 giờ = 2 * 60 * 60 = 7200 giây
const SESSION_TTL = 7200; // 2 hours in seconds
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
    private readonly chatService: ChatService,
    private readonly notificationService: NotificationService,
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


  @SubscribeMessage('joinRoom')
  async handleJoinRoom(client: Socket, sessionId: string) {
    client.join(sessionId);
    console.log(`[Chat] Client ${client.id} joined room: ${sessionId}`);
    
    // Send existing messages to the newly joined client
    const messages = await this.chatService.getMessagesFromRedis(sessionId);
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
  async handleJoin(client: Socket, data: { sessionId: string }) {
    client.join(data.sessionId);

    // Refresh session TTL khi user join
    const sessionKey = getSessionInfoKey(data.sessionId);
    const chatSession = await this.cacheManager.get<ChatSession>(sessionKey);

    if (chatSession) {
      await this.cacheManager.set(sessionKey, chatSession, SESSION_TTL);
      console.log(`[Chat] Session ${data.sessionId} TTL refreshed on join`);
    }
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

    console.log(
      `[Chat] Handling message for session: ${data.sessionId}, existing session:`,
      !!chatSession,
    );

    const isNewSession = !chatSession;
    
    if (!chatSession) {
      console.log(`[Chat] Creating new session: ${data.sessionId}`);
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

      // Notify support team when new chat session is created (triggered by first message)
      if (chatSession.user) {
        await this.notificationService.notifyChatSessionCreated(
          chatSession.user.user_id,
          chatSession.user.username || `User ${chatSession.user.user_id}`,
          data.sessionId,
        );
      }
    } else {
      // Session đã tồn tại, refresh TTL để không bị expire
      console.log(`[Chat] Refreshing existing session: ${data.sessionId}`);
      await this.cacheManager.set(sessionKey, chatSession, SESSION_TTL);
    }

    const message = {
      id: `${Date.now()}-${Math.random()}`,
      sessionId: data.sessionId,
      senderId: data.sender,
      messageText: data.message,
      timestamp: new Date().toISOString(),
    };

    // Ensure client is in the room before processing message
    client.join(data.sessionId);

    // Sử dụng service để lưu message vào Redis
    try {
      await this.chatService.saveMessageToRedis(data.sessionId, message);

      // Refresh session TTL sau khi lưu message thành công
      await this.cacheManager.set(sessionKey, chatSession, SESSION_TTL);
      console.log(
        `[Chat] Message saved successfully for session ${data.sessionId}`,
      );

    } catch (error) {
      console.error('Failed to save message to Redis:', error);
      // Don't return here - still emit the message for real-time chat
    }

    // Emit message to all clients in the room ONCE
    this.server.to(data.sessionId).emit('message', message);
    console.log(`[Chat] Message emitted to room ${data.sessionId}: "${message.messageText.substring(0, 50)}..."`);
    
    // Also emit to sender to confirm message was sent
    client.emit('messageSent', { 
      messageId: message.id, 
      sessionId: data.sessionId,
      status: 'sent' 
    });
  }

  @SubscribeMessage('getHistory')
  async handleGetHistory(client: Socket, sessionId: string) {
    console.log(`[Chat] Getting history for session: ${sessionId}`);
    
    // Sử dụng service để lấy messages từ Redis
    const messages = await this.chatService.getMessagesFromRedis(sessionId);
    console.log(`[Chat] Found ${messages.length} messages for session ${sessionId}`);

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
    console.log(`[Chat] History sent to client for session ${sessionId}`);
  }

  // Thêm method để check session status
  @SubscribeMessage('checkSession')
  async handleCheckSession(client: Socket, sessionId: string) {
    const sessionKey = getSessionInfoKey(sessionId);
    const chatSession = await this.cacheManager.get<ChatSession>(sessionKey);

    if (chatSession) {
      // Refresh TTL nếu session tồn tại
      await this.cacheManager.set(sessionKey, chatSession, SESSION_TTL);
      console.log(`[Chat] Session ${sessionId} checked and TTL refreshed`);
      client.emit('sessionStatus', {
        sessionId,
        status: 'active',
        session: chatSession,
      });
    } else {
      console.log(`[Chat] Session ${sessionId} not found or expired`);
      client.emit('sessionStatus', {
        sessionId,
        status: 'expired',
        session: null,
      });
    }
  }
}
