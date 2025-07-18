import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Exam } from '../exam/entities/exam.entity';
import { ResultExam } from './entities/result_exam.entity';
import { User } from '../user/entities/user.entity';
import { ExamQuestion } from '../exam/entities/examQuestion.entity';
import { Answer } from '../exam/entities/answerExam.entity';
import { Certificate } from '../certificate/entities/certificate.entity';
import { ResultExamController } from './result_exam.controller';
import { ResultExamService } from './result_exam.service';
import { CertificateModule } from '../certificate/certificate.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ResultExam,
      Exam,
      User,
      ExamQuestion,
      Answer,
      Certificate,
    ]),
    CertificateModule, // Import CertificateModule to use CertificateService
  ],
  controllers: [ResultExamController],
  providers: [ResultExamService],
  exports: [ResultExamService],
})
export class ResultExamModule {}