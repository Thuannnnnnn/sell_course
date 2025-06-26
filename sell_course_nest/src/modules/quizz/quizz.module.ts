import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quizz } from './entities/quizz.entity';
import { Questionentity } from './entities/question.entity';
import { AnswerEntity } from './entities/answer.entity';
import { QuizzController, AdminQuizzController } from './quizz.controller';
import { QuizzService } from './quizz.service';
import { Contents } from '../contents/entities/contents.entity';
import { Lesson } from '../lesson/entities/lesson.entity';
import { Course } from '../course/entities/course.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Quizz, 
      Questionentity, 
      AnswerEntity, 
      Contents,
      Lesson,
      Course
    ]),
  ],
  controllers: [QuizzController, AdminQuizzController],
  providers: [QuizzService],
  exports: [QuizzService],
})
export class QuizzModule {
  public constructor() {}
}
