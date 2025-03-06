import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QaStudy } from './entities/qa.entity';
import { QaStudyService } from './qa_study.service';
import { QaStudyController } from './qa_study.controller';
import { UserModule } from '../user/user.module';
import { User } from '../user/entities/user.entity';
import { Course } from '../course/entities/course.entity';
import { CourseModule } from '../course/course.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([QaStudy, User, Course]),
    UserModule,
    CourseModule,
  ],
  providers: [QaStudyService],
  controllers: [QaStudyController],
})
export class QaStudyModule {}
