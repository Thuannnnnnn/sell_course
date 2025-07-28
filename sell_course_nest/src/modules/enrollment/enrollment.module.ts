import { Module } from '@nestjs/common';
import { Enrollment } from './entities/enrollment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnrollmentController } from './enrollment.controller';
import { EnrollmentService } from './enrollment.service';
import { User } from '../user/entities/user.entity';
import { Course } from '../course/entities/course.entity';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Enrollment, User, Course]),
    NotificationModule,
  ],
  controllers: [EnrollmentController],
  providers: [EnrollmentService],
  exports: [EnrollmentService],
})
export class EnrollmentModule {}
