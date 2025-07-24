import { IsUUID, IsEnum, IsOptional } from 'class-validator';
import { NotificationStatus } from '../enums/notification-type.enum';

export class MarkNotificationDto {
  @IsUUID()
  notificationId: string;

  @IsEnum(NotificationStatus)
  status: NotificationStatus;
}

export class MarkAllNotificationsDto {
  @IsEnum(NotificationStatus)
  @IsOptional()
  status?: NotificationStatus = NotificationStatus.READ;
}