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
    console.log('Client disconnected');
    const sessionId = client.handshake.query.sessionId as string;
    console.log('Session ID:', sessionId);

    if (sessionId) {
      try {
        const session = await this.chatSessionRepository.findOne({
          where: { id: sessionId },
        });
        console.log('Found session:', session);

        if (session) {
          session.isActive = false;
          session.endTime = new Date();
          try {
            const updatedSession =
              await this.chatSessionRepository.save(session);
            console.log('Updated session:', updatedSession);

            // Verify the update
            const verifySession = await this.chatSessionRepository.findOne({
              where: { id: sessionId },
            });
            console.log('Verified session after update:', verifySession);
          } catch (error) {
            console.error('Error saving session:', error);
            // Thử lưu lại một lần nữa
            try {
              const retrySession = await this.chatSessionRepository.findOne({
                where: { id: sessionId },
              });
              if (retrySession) {
                retrySession.isActive = false;
                retrySession.endTime = new Date();
                await this.chatSessionRepository.save(retrySession);
                console.log('Successfully updated session on retry');
              }
            } catch (retryError) {
              console.error('Error on retry:', retryError);
            }
          }
        } else {
          console.log('No session found with ID:', sessionId);
        }
      } catch (error) {
        console.error('Error in handleDisconnect:', error);
      }
    } else {
      console.log('No session ID provided');
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
    const message = this.messageRepository.create({
      sessionId: data.sessionId,
      sender: data.sender,
      messageText: data.message,
      timestamp: new Date(),
    });
    await this.messageRepository.save(message);
    this.server.to(data.sessionId).emit('message', message);
  }
}
