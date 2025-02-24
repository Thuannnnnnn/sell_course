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

    // Xóa kết quả cũ nếu có
    const existingResult = await this.quizzStoreRepository.findOne({
      where: {
        user: { user_id },
        quizz: { quizzId: submitQuizDto.quizzId },
      },
    });

    if (existingResult) {
      await this.quizzStoreRepository.remove(existingResult);
    }

    let score = 0;
    const answersResult = [];
    const totalQuestions = quiz.questions.length;

    if (totalQuestions === 0) {
      throw new BadRequestException('Quiz không có câu hỏi nào');
    }

    for (const question of quiz.questions) {
      const submission = submitQuizDto.answers.find(
        (ans) => ans.questionId === question.questionId,
      );

      if (!submission) {
        answersResult.push({
          questionId: question.questionId,
          answerId: null,
          isCorrect: false,
        });
        continue;
      }

      const selectedAnswer = question.answers.find(
        (a) => a.answerId === submission.answerId,
      );
      const isCorrect = selectedAnswer ? selectedAnswer.isCorrect : false;

      if (isCorrect) {
        score++;
      }

      answersResult.push({
        questionId: submission.questionId,
        answerId: submission.answerId,
        isCorrect,
      });
    }

    const percentageScore = (score / totalQuestions) * 100;

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

    if (!results.quizz.contentId) {
      throw new BadRequestException('Content ID not found for this quiz');
    }

    if (!results.user.user_id) {
      throw new BadRequestException('User ID not found');
    }

    if (!results.quizz.quizzId) {
      throw new BadRequestException('Quiz ID not found');
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

    return results.map((result) => {
      if (
        !result.quizz.contentId ||
        !result.quizz.quizzId ||
        !result.user.user_id
      ) {
        throw new BadRequestException('Missing required IDs for quiz result');
      }

      return {
        ...result,
        contentId: result.quizz.contentId,
        quizzId: result.quizz.quizzId,
        userId: result.user.user_id,
      };
    });
  }
}
