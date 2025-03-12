import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { ForumService } from './forum.service';
import { ForumResponseDto } from './dto/forum-response.dto';

@WebSocketGateway({
  cors: { origin: '*' },
})
@Injectable()
export class ForumGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => ForumService))
    private readonly forumService: ForumService,
  ) {}

  @SubscribeMessage('getForums')
  async handleGetForums(): Promise<void> {
    const forums = await this.forumService.findAll();
    this.server.emit('forums', forums);
  }

  async notifyForumUpdate(forums: ForumResponseDto[]): Promise<void> {
    this.server.emit('forums', forums);
  }
}
