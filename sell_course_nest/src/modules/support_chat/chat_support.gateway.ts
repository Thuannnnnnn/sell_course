import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { ChatSession } from './entities/chat-session.entity';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server;

  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(ChatSession)
    private chatSessionRepository: Repository<ChatSession>,
  ) {}

  async handleConnection(client: Socket) {
    const sessionId = client.handshake.query.sessionId as string;

    if (sessionId) {
      const session = await this.chatSessionRepository.findOne({
        where: { id: sessionId },
      });

      if (session) {
        session.isActive = true;
        await this.chatSessionRepository.save(session);
      }
    }
  }

  async handleDisconnect(client: Socket) {
    const sessionId = client.handshake.query.sessionId as string;

    if (sessionId) {
      const session = await this.chatSessionRepository.findOne({
        where: { id: sessionId },
      });

      if (session) {
        session.isActive = false;
        session.endTime = new Date();
        await this.chatSessionRepository.save(session);
      }
    }
  }

  @SubscribeMessage('join')
  handleJoin(client: Socket, data: { sessionId: string }) {
    client.join(data.sessionId);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    client: Socket,
    data: { sessionId: string; message: string; sender: string },
  ) {
    const chatSession = await this.chatSessionRepository.findOne({
      where: { id: data.sessionId },
    });

    if (!chatSession) {
      client.emit('error', { message: 'Chat session not found' });
      return;
    }

    // Load the sender (User) entity from the database
    const sender = await this.messageRepository.manager.findOne('User', {
      where: { user_id: data.sender },
    });

    if (!sender) {
      client.emit('error', { message: 'Sender not found' });
      return;
    }

    // Create and save the message
    const message = this.messageRepository.create({
      chatSession: chatSession,
      sender: sender, // Use the loaded User entity
      messageText: data.message,
      timestamp: new Date(),
    });

    await this.messageRepository.save(message);

    // Emit the message to the chat session
    this.server.to(data.sessionId).emit('message', message);
  }
}
