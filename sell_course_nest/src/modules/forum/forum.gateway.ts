import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { ForumService } from './forum.service';
import { ForumResponseDto } from './dto/forum-response.dto';

@WebSocketGateway({
  cors: { origin: '*' },
})
@Injectable()
export class ForumGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => ForumService))
    private readonly forumService: ForumService,
  ) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinForumRoom')
  handleJoinForumRoom(client: Socket, forumId: string): void {
    client.join(forumId);
    console.log(`Client ${client.id} joined room ${forumId}`);
  }

  @SubscribeMessage('leaveForumRoom')
  handleLeaveForumRoom(client: Socket, forumId: string): void {
    client.leave(forumId);
    console.log(`Client ${client.id} left room ${forumId}`);
  }

  @SubscribeMessage('getForums')
  async handleGetForums(client: Socket): Promise<void> {
    const forums = await this.forumService.findAll();
    client.emit('forums', forums);
  }

  @SubscribeMessage('deleteForum')
  async handleDeleteForum(client: Socket, forumId: string): Promise<void> {
    this.server.to(forumId).emit('forumDeleted', forumId);
    console.log(`Emitted forumDeleted to room ${forumId}`);
  }

  async notifyForumUpdate(forums: ForumResponseDto[]): Promise<void> {
    this.server.emit('forums', forums);
    console.log('Emitted forums update to all clients');
  }

  async notifyReactionsUpdate(forumId: string, reactions: any[]): Promise<void> {
    console.log(`Emitting forumReactionsUpdated to room ${forumId}:`, reactions);
    this.server.to(forumId).emit('forumReactionsUpdated', { forumId, reactions });
  }
}