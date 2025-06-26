import { ContentController } from './contents.controller';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contents } from './entities/contents.entity';
import { Lesson } from '../lesson/entities/lesson.entity';
import { Quizz } from '../quizz/entities/quizz.entity';
import { Questionentity } from '../quizz/entities/question.entity';
import { AnswerEntity } from '../quizz/entities/answer.entity';
import { ContentService } from './contents.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Contents,
      Lesson,
      Quizz,
      Questionentity,
      AnswerEntity,
    ]),
  ],
  controllers: [ContentController],
  providers: [ContentService],
})
export class ContentModule {}
