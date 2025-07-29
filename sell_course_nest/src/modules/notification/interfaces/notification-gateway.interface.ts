import { RealTimeNotificationData } from '../dto/notification-response.dto';

export interface INotificationGateway {
  sendNotificationToUser(userId: string, notification: RealTimeNotificationData): Promise<void>;
  sendNotificationToRole(role: string, notification: RealTimeNotificationData): Promise<void>;
  sendNotificationToUsers(userIds: string[], notification: RealTimeNotificationData): Promise<void>;
}