import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { User } from '../user/entities/user.entity';
import { Category } from '../category/entities/category.entity';
import { Lesson } from '../lesson/entities/lesson.entity';
import { Contents } from '../contents/entities/contents.entity';
import { Video } from '../video/entities/video.entity';
import { Docs } from '../docs/entities/docs.entity';
import { Quizz } from '../quizz/entities/quizz.entity';
import { Exam } from '../exam/entities/exam.entity';
import { NotificationModule } from '../notification/notification.module';
import { Notification } from '../notification/entities/notification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, User, Category, Lesson, Contents, Video, Docs, Quizz, Exam, Notification]),
    NotificationModule,
  ],
  providers: [CourseService],
  controllers: [CourseController],
  exports: [CourseService],
})
export class CourseModule {}
