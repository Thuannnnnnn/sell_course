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
    if (!submitQuizDto.quizzId) {
      throw new BadRequestException('quizzId is required');
    }

    const user = await this.userRepository.findOne({ where: { user_id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${user_id} not found`);
    }

    const quiz = await this.quizzRepository.findOne({
      where: { quizzId: submitQuizDto.quizzId },
      relations: ['questions', 'questions.answers'],
    });
    if (!quiz) {
      throw new NotFoundException(
        `Quiz with ID ${submitQuizDto.quizzId} not found`,
      );
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

    if (!quiz.questions || quiz.questions.length === 0) {
      throw new BadRequestException('Quiz has no questions');
    }

    const validQuestionIds = quiz.questions.map((q) => q.questionId);

    let score = 0;
    const answersResult = [];

    if (!submitQuizDto.answers || submitQuizDto.answers.length === 0) {
      for (const questionId of validQuestionIds) {
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
        if (!validQuestionIds.includes(submission.questionId)) {
          throw new BadRequestException(
            `Invalid question ID: ${submission.questionId}. It must belong to quiz ${submitQuizDto.quizzId}`,
          );
        }

        const question = quiz.questions.find(
          (q) => q.questionId === submission.questionId,
        );
        if (!question) {
          throw new BadRequestException(
            `Question with ID ${submission.questionId} not found in quiz`,
          );
        }

        if (submission.answerId) {
          const validAnswer = question.answers.find(
            (a) => a.answerId === submission.answerId,
          );
          if (!validAnswer) {
            throw new BadRequestException(
              `Answer with ID ${submission.answerId} is invalid for question ${submission.questionId}`,
            );
          }

          const isCorrect = validAnswer.isCorrect;
          if (isCorrect) {
            score++;
          }

          answersResult.push({
            questionId: submission.questionId,
            answerId: submission.answerId,
            isCorrect,
          });
        } else {
          answersResult.push({
            questionId: submission.questionId,
            answerId: null,
            isCorrect: false,
          });
        }
      }

      const unansweredQuestions = validQuestionIds.filter(
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
    const maxAnswers = 10;
    if (submitQuizDto.answers && submitQuizDto.answers.length > maxAnswers) {
      throw new BadRequestException(`Maximum ${maxAnswers} answers allowed`);
    }
    console.log(submitQuizDto.answers);

    const rawPercentageScore = (score / submitQuizDto.answers.length) * 100;
    console.log(submitQuizDto.answers.length);
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
