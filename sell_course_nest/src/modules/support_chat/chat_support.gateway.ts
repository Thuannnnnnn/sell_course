import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';

@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer() server;

  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

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
