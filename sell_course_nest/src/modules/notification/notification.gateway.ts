import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { NotificationService } from './notification.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/notifications',
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, AuthenticatedSocket>();

  constructor(private notificationService: NotificationService) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Trong thực tế, bạn sẽ verify JWT token từ client
      // Ở đây tôi giả sử client gửi userId trong handshake
      const userId = client.handshake.query.userId as string;
      const userRole = client.handshake.query.userRole as string;

      if (userId) {
        client.userId = userId;
        client.userRole = userRole;
        this.connectedUsers.set(userId, client);
        
        // Join user to their personal room
        client.join(`user_${userId}`);
        
        // Join user to role-based rooms
        if (userRole) {
          client.join(`role_${userRole}`);
        }

        console.log(`User ${userId} connected to notifications`);
        
        // Gửi số lượng thông báo chưa đọc
        const unreadCount = await this.notificationService.getUnreadCount(userId);
        client.emit('unread_count', { count: unreadCount });
      }
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectedUsers.delete(client.userId);
      console.log(`User ${client.userId} disconnected from notifications`);
    }
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    client.join(data.room);
    client.emit('joined_room', { room: data.room });
  }

  @SubscribeMessage('get_notifications')
  async handleGetNotifications(
    @MessageBody() data: { page?: number; limit?: number },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) return;

    try {
      const notifications = await this.notificationService.getUserNotifications(
        client.userId,
        data.page || 1,
        data.limit || 20,
      );
      client.emit('notifications_list', notifications);
    } catch (error) {
      client.emit('error', { message: 'Failed to fetch notifications' });
    }
  }

  @SubscribeMessage('mark_notification_read')
  async handleMarkNotificationRead(
    @MessageBody() data: { notificationId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) return;

    try {
      await this.notificationService.markNotification(client.userId, {
        notificationId: data.notificationId,
        status: 'READ' as any,
      });
      
      const unreadCount = await this.notificationService.getUnreadCount(client.userId);
      client.emit('unread_count', { count: unreadCount });
      client.emit('notification_marked', { notificationId: data.notificationId });
    } catch (error) {
      client.emit('error', { message: 'Failed to mark notification as read' });
    }
  }

  // Method để gửi thông báo real-time cho user cụ thể
  async sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user_${userId}`).emit('new_notification', notification);
    
    // Cập nhật unread count
    const unreadCount = await this.notificationService.getUnreadCount(userId);
    this.server.to(`user_${userId}`).emit('unread_count', { count: unreadCount });
  }

  // Method để gửi thông báo cho tất cả users có role cụ thể
  async sendNotificationToRole(role: string, notification: any) {
    this.server.to(`role_${role}`).emit('new_notification', notification);
  }

  // Method để gửi thông báo cho nhiều users
  async sendNotificationToUsers(userIds: string[], notification: any) {
    for (const userId of userIds) {
      await this.sendNotificationToUser(userId, notification);
    }
  }
}