import { IsString, IsEnum, IsOptional, IsUUID, IsObject } from 'class-validator';
import { NotificationType, NotificationPriority } from '../enums/notification-type.enum';

export class CreateNotificationDto {
  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsEnum(NotificationPriority)
  @IsOptional()
  priority?: NotificationPriority;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;

  @IsUUID()
  @IsOptional()
  createdBy?: string;

  @IsUUID()
  @IsOptional()
  courseId?: string;

  // Danh sách user IDs sẽ nhận thông báo
  @IsUUID('4', { each: true })
  recipientIds: string[];
}