import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { QaStudyService } from './qa_study.service';
@WebSocketGateway({
  cors: { origin: '*' },
})
@Injectable()
export class QaGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => QaStudyService))
    private readonly qaService: QaStudyService,
  ) {}

  @SubscribeMessage('getQas')
  async handleGetQas(client: Socket, courseId: string): Promise<void> {
    const qas = await this.qaService.findByCourseId(courseId);
    client.emit('qaList', qas);
  }

  async notifyQasUpdate(courseId: string): Promise<void> {
    const qas = await this.qaService.findByCourseId(courseId);
    this.server.emit('qaList', qas);
  }
}
