import { Module } from '@nestjs/common';
import { Notify } from './entities/notify.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotifyController } from './notify.controller';
import { NotifyService } from './notify.service';
import { UserNotify } from '../User_Notify/entities/User_Notify.entity';
import { NotifyGateway } from './notify.gateway';
import { Course } from '../course/entities/course.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notify, UserNotify, Course, User]),
  ],
  controllers: [NotifyController],
  providers: [NotifyService, NotifyGateway],
  exports: [NotifyService, NotifyGateway],
})
export class NotifyModule {}
