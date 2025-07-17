import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  QuizzStoreController,
  UserQuizResultsController,
} from './quizz_store.controller';
import { QuizzStoreService } from './quizz_store.service';
import { QuizzStore } from './entities/quizz_store.entity';
import { Quizz } from '../quizz/entities/quizz.entity';
import { User } from '../user/entities/user.entity';
import { Questionentity } from '../quizz/entities/question.entity';
import { AnswerEntity } from '../quizz/entities/answer.entity';
import { Contents } from '../contents/entities/contents.entity';
import { Lesson } from '../lesson/entities/lesson.entity';
import { Course } from '../course/entities/course.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QuizzStore,
      Quizz,
      User,
      Questionentity,
      AnswerEntity,
      Contents,
      Lesson,
      Course,
    ]),
  ],
  controllers: [QuizzStoreController, UserQuizResultsController],
  providers: [QuizzStoreService],
  exports: [QuizzStoreService],
})
export class QuizzStoreModule {}
