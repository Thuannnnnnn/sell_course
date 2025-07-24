import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { CourseNotificationService } from './course-notification.service';
import { ChatNotificationService } from './chat-notification.service';
import { NotificationGateway } from './notification.gateway';
import { Notification } from './entities/notification.entity';
import { UserNotification } from './entities/user-notification.entity';
import { User } from '../user/entities/user.entity';
import { Course } from '../course/entities/course.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { ChatSession } from '../support_chat/entities/chat-session.entity';
import { Message } from '../support_chat/entities/message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notification,
      UserNotification,
      User,
      Course,
      Enrollment,
      ChatSession,
      Message,
    ]),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    CourseNotificationService,
    ChatNotificationService,
    NotificationGateway,
  ],
  exports: [
    NotificationService,
    CourseNotificationService,
    ChatNotificationService,
    NotificationGateway,
  ],
})
export class NotificationModule implements OnModuleInit {
  constructor(
    private notificationService: NotificationService,
    private notificationGateway: NotificationGateway,
  ) {}

  onModuleInit() {
    // Set gateway reference in service to avoid circular dependency
    this.notificationService.setNotificationGateway(this.notificationGateway);
  }
}