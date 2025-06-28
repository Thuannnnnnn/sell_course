
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamQuestionService } from './exam.service';
import { ExamQuestionController } from './exam.controller';
import { Exam } from './entities/exam.entity';
import { ExamQuestion } from './entities/examQuestion.entity';
import { Answer } from './entities/answerExam.entity';
import { Quizz } from '../quizz/entities/quizz.entity';
import { Questionentity } from '../quizz/entities/question.entity';
import { AnswerEntity } from '../quizz/entities/answer.entity'; // Import quiz answer entity

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Exam entities
      Exam,
      ExamQuestion,
      Answer,
      // Quiz entities (to read from)
      Quizz,
      Questionentity,
      AnswerEntity
    ])
  ],
  providers: [ExamQuestionService],
  controllers: [ExamQuestionController],
  exports: [ExamQuestionService],
})
export class ExamModule {}