import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { QaStudyService } from './qa_study.service';
import { ResponseQaDto } from './dto/response-qa.dto';

interface ReactionChangeDto {
  qaId: string;
  userId: string;
  reactionType: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class QaGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private clients = new Map<string, Set<string>>();

  constructor(
    @Inject(forwardRef(() => QaStudyService))
    private readonly qaService: QaStudyService,
  ) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.clients.forEach((socketSet, courseId) => {
      socketSet.delete(client.id);
      if (socketSet.size === 0) {
        this.clients.delete(courseId);
      }
    });
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinCourse')
  async handleJoinCourse(client: Socket, courseId: string) {
    if (!this.clients.has(courseId)) {
      this.clients.set(courseId, new Set());
    }
    this.clients.get(courseId).add(client.id);
    const qaList = await this.qaService.findByCourseId(courseId);
    client.emit('qaList', qaList);
  }

  @SubscribeMessage('leaveCourse')
  handleLeaveCourse(client: Socket, courseId: string) {
    if (this.clients.has(courseId)) {
      this.clients.get(courseId).delete(client.id);
      if (this.clients.get(courseId).size === 0) {
        this.clients.delete(courseId);
      }
    }
  }

  async broadcastNewQa(qa: ResponseQaDto) {
    const courseId = qa.courseId;
    if (this.clients.has(courseId)) {
      const socketIds = this.clients.get(courseId);
      socketIds.forEach((socketId) => {
        this.server.to(socketId).emit('newQa', qa);
      });
    }
  }
  async broadcastRemoveQa(qaId: string, courseId: string) {
    if (this.clients.has(courseId)) {
      const socketIds = this.clients.get(courseId);
      socketIds.forEach((socketId) => {
        this.server.to(socketId).emit('removeQa', { qaId });
      });
    }
  }
  async broadcastReactionChange(reaction: ReactionChangeDto) {
    const { qaId } = reaction;
    const qa = await this.qaService.findOne(qaId);
    const courseId = qa.course.courseId;

    if (this.clients.has(courseId)) {
      const socketIds = this.clients.get(courseId);
      socketIds.forEach((socketId) => {
        this.server.to(socketId).emit('reactionChange', reaction);
      });
    }
  }
}
