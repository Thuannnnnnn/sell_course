import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
})
@Injectable()
export class NotifyGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private activeUsers = new Map<string, string>();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) this.activeUsers.set(userId, client.id);
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.activeUsers.entries()) {
      if (socketId === client.id) {
        this.activeUsers.delete(userId);
        break;
      }
    }
  }

  sendMarkAllAsSentToUser(userId: string, notifications: any[]) {
    const socketId = this.activeUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('markAllAsSent', notifications);
    }
  }

  sendNotificationToUser(userId: string, notification: any) {
    const socketId = this.activeUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('newNotification', notification);
    }
  }

  sendUpdateToUser(userId: string, notification: any) {
    const socketId = this.activeUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('updateNotification', notification);
    }
  }

  sendRemoveToUser(userId: string, userNotifyId: string) {
    const socketId = this.activeUsers.get(userId);

    if (socketId) {
      this.server.to(socketId).emit('removeNotification', userNotifyId);
    }
  }
}
