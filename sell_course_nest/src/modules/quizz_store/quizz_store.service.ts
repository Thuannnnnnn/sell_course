import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizzStore } from './entities/quizz_store.entity';
import { Quizz } from '../quizz/entities/quizz.entity';
import { User } from '../user/entities/user.entity';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class QuizzStoreService {
  constructor(
    @InjectRepository(QuizzStore)
    private quizzStoreRepository: Repository<QuizzStore>,
    @InjectRepository(Quizz)
    private quizzRepository: Repository<Quizz>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async submitQuiz(user_id: string, submitQuizDto: SubmitQuizDto) {
    const user = await this.userRepository.findOne({
      where: { user_id },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const quiz = await this.quizzRepository.findOne({
      where: { quizzId: submitQuizDto.quizzId },
      relations: ['questions', 'questions.answers'],
    });
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    const existingResult = await this.quizzStoreRepository.findOne({
      where: {
        user: { user_id },
        quizz: { quizzId: submitQuizDto.quizzId },
      },
    });

    if (existingResult) {
      await this.quizzStoreRepository.remove(existingResult);
    }

    if (quiz.questions.length === 0) {
      throw new BadRequestException('Quiz không có câu hỏi nào');
    }

    const requiredQuestions = Math.min(10, quiz.questions.length);

    let score = 0;
    const answersResult = [];

    const requiredQuestionIds = quiz.questions
      .slice(0, requiredQuestions)
      .map((q) => q.questionId);

    if (!submitQuizDto.answers || submitQuizDto.answers.length === 0) {
      for (const questionId of requiredQuestionIds) {
        answersResult.push({
          questionId,
          answerId: null,
          isCorrect: false,
        });
      }
    } else {
      const submittedQuestionIds = submitQuizDto.answers.map(
        (a) => a.questionId,
      );

      for (const submission of submitQuizDto.answers) {
        if (!requiredQuestionIds.includes(submission.questionId)) {
          throw new BadRequestException(
            `Câu hỏi với ID ${submission.questionId} không nằm trong danh sách yêu cầu`,
          );
        }

        const question = quiz.questions.find(
          (q) => q.questionId === submission.questionId,
        );

        const selectedAnswer = question.answers.find(
          (a) => a.answerId === submission.answerId,
        );

        const isCorrect = selectedAnswer ? selectedAnswer.isCorrect : false;
        if (isCorrect) {
          score++;
        }

        answersResult.push({
          questionId: submission.questionId,
          answerId: submission.answerId || null,
          isCorrect,
        });
      }

      const unansweredQuestions = requiredQuestionIds.filter(
        (qId) => !submittedQuestionIds.includes(qId),
      );

      for (const questionId of unansweredQuestions) {
        answersResult.push({
          questionId,
          answerId: null,
          isCorrect: false,
        });
      }
    }

    if (answersResult.length !== requiredQuestions) {
      throw new BadRequestException(
        `Số lượng câu trả lời không khớp với ${requiredQuestions} câu hỏi yêu cầu`,
      );
    }

    const rawPercentageScore = (score / requiredQuestions) * 100;
    const percentageScore = Math.round(rawPercentageScore);

    const quizStore = this.quizzStoreRepository.create({
      storeId: uuidv4(),
      user,
      quizz: quiz,
      score: percentageScore,
      answers: answersResult,
    });

    return this.quizzStoreRepository.save(quizStore);
  }

  async getUserQuizResults(
    user_id: string,
    quizzId: string,
    contentId: string,
  ) {
    const results = await this.quizzStoreRepository.findOne({
      where: {
        user: { user_id },
        quizz: { quizzId, contentId },
      },
      relations: ['quizz', 'user', 'quizz.contents'],
    });

    if (!results) {
      throw new NotFoundException('Quiz results not found');
    }

    return {
      ...results,
      contentId: results.quizz.contentId,
      quizzId: results.quizz.quizzId,
      userId: results.user.user_id,
    };
  }

  async getAllUserQuizResults(user_id: string) {
    const results = await this.quizzStoreRepository.find({
      where: {
        user: { user_id },
      },
      relations: ['quizz', 'user', 'quizz.contents'],
      order: {
        createdAt: 'DESC',
      },
    });

    return results.map((result) => ({
      ...result,
      contentId: result.quizz.contentId,
      quizzId: result.quizz.quizzId,
      userId: result.user.user_id,
    }));
  }
}
