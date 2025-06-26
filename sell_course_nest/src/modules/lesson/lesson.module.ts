import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonService } from './lesson.service';
import { LessonController } from './lesson.controller';
import { Lesson } from './entities/lesson.entity';
import { Course } from '../course/entities/course.entity';
import { Contents } from '../contents/entities/contents.entity';
import { Quizz } from '../quizz/entities/quizz.entity';
import { Questionentity } from '../quizz/entities/question.entity';
import { AnswerEntity } from '../quizz/entities/answer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Lesson,
      Course,
      Contents,
      Quizz,
      Questionentity,
      AnswerEntity,
    ]),
  ],
  controllers: [LessonController],
  providers: [LessonService],
  exports: [LessonService],
})
export class LessonModule {}
