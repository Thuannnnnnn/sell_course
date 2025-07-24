import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { CourseNotificationService } from './course-notification.service';
import { PromotionNotificationService } from './promotion-notification.service';
import { NotificationGateway } from './notification.gateway';
import { Notification } from './entities/notification.entity';
import { UserNotification } from './entities/user-notification.entity';
import { User } from '../user/entities/user.entity';
import { Course } from '../course/entities/course.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { Promotion } from '../promotion/entities/promotion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notification,
      UserNotification,
      User,
      Course,
      Enrollment,
      Promotion,
    ]),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    CourseNotificationService,
    PromotionNotificationService,
    NotificationGateway,
  ],
  exports: [
    NotificationService,
    CourseNotificationService,
    PromotionNotificationService,
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