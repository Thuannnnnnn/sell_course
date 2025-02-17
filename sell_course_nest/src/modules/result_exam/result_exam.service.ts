import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ResultExam } from './entities/result_exam.entity';
import { Exam } from '../exam/entities/exam.entity';
import { User } from '../user/entities/user.entity';
import { SubmitExamDto } from './dto/submit-exam.dto';

@Injectable()
export class ResultExamService {
  constructor(
    @InjectRepository(ResultExam)
    private resultExamRepository: Repository<ResultExam>,
    @InjectRepository(Exam)
    private examRepository: Repository<Exam>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async submitExam(user_id: string, submitExamDto: SubmitExamDto) {
    const user = await this.userRepository.findOne({
      where: { user_id },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const exam = await this.examRepository.findOne({
      where: { examId: submitExamDto.examId },
      relations: ['questions', 'questions.answers'],
    });
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    const existingResult = await this.resultExamRepository.findOne({
      where: {
        user: { user_id },
        exam: { examId: submitExamDto.examId },
      },
    });

    if (existingResult) {
      await this.resultExamRepository.remove(existingResult);
    }

    let score = 0;
    const answersResult = [];

    for (const submission of submitExamDto.answers) {
      console.log('Processing submission:', submission);

      const question = exam.questions.find(
        (q) => q.questionId === submission.questionId,
      );
      if (!question) {
        continue;
      }

      const selectedAnswer = question.answers.find(
        (a) => a.answerId === submission.answerId,
      );
      if (!selectedAnswer) {
        continue;
      }

      const isCorrect = selectedAnswer.isCorrect;
      if (isCorrect) {
        score++;
      }

      answersResult.push({
        questionId: submission.questionId,
        answerId: submission.answerId,
        isCorrect,
      });
    }

    const totalQuestions = exam.questions.length;
    const percentageScore = (score / totalQuestions) * 100;

    const resultExam = this.resultExamRepository.create({
      resultExamId: uuidv4(),
      user,
      exam: exam,
      score: percentageScore,
      answers: answersResult,
    });

    return this.resultExamRepository.save(resultExam);
  }

  async getUserExamResults(user_id: string, examId: string) {
    const results = await this.resultExamRepository.findOne({
      where: {
        user: { user_id },
        exam: { examId },
      },
      relations: ['exam', 'user'],
    });

    if (!results) {
      throw new NotFoundException('Exam results not found');
    }

    return results;
  }

  async getAllUserExamResults(user_id: string) {
    const results = await this.resultExamRepository.find({
      where: {
        user: { user_id },
      },
      relations: ['exam', 'user'],
      order: {
        createdAt: 'DESC',
      },
    });

    return results;
  }
}
