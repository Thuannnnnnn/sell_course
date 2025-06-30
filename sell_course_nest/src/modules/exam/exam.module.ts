import { Module } from '@nestjs/common';
import { ExamQuestionService } from './exam.service';
import { Exam } from './entities/exam.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamQuestionController } from './exam.controller';
import { ExamQuestion } from './entities/examQuestion.entity';
import { Answer } from './entities/answerExam.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Exam, ExamQuestion, Answer])],
  providers: [ExamQuestionService],
  controllers: [ExamQuestionController],
  exports: [ExamQuestionService],
})
export class ExamModule {}
