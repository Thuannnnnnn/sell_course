import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QaStudy } from './entities/qa.entity';
import { QaStudyService } from './qa_study.service';
import { QaStudyController } from './qa_study.controller';
import { UserModule } from '../user/user.module';
import { User } from '../user/entities/user.entity';
import { Course } from '../course/entities/course.entity';
import { CourseModule } from '../course/course.module';
import { ReactionQaService } from './reaction_qa.service';
import { ReactionQaController } from './reaction_qa.controller';
import { ReactionQa } from './entities/reaction_qa.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([QaStudy, User, Course, ReactionQa]),
    UserModule,
    CourseModule,
  ],
  providers: [QaStudyService, ReactionQaService],
  controllers: [QaStudyController, ReactionQaController],
})
export class QaStudyModule {}
