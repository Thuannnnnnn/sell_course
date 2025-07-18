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

@Module({
  imports: [
    TypeOrmModule.forFeature([Notify, UserNotify, Course, User, Enrollment]),
  ],
  controllers: [NotifyController],
  providers: [NotifyService, NotifyGateway],
})
export class NotifyModule {}
