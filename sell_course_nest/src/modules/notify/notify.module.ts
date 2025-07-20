import { Module } from '@nestjs/common';
import { Notify } from './entities/notify.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotifyController } from './notify.controller';
import { NotifyService } from './notify.service';
import { UserNotify } from '../User_Notify/entities/user_Notify.entity';
import { NotifyGateway } from './notify.gateway';
import { Course } from '../course/entities/course.entity';
import { User } from '../user/entities/user.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { Category } from '../category/entities/category.entity';
import { AutomaticNotificationService } from './services/automatic-notification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notify, UserNotify, Course, User, Enrollment, Category]),
  ],
  controllers: [NotifyController],
  providers: [NotifyService, NotifyGateway, AutomaticNotificationService],
  exports: [NotifyService, AutomaticNotificationService],
})
export class NotifyModule {}
