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
      // Tìm câu trả lời của người dùng cho câu hỏi này
      const submission = submitQuizDto.answers.find(
        (ans) => ans.questionId === question.questionId,
      );

      if (!submission) {
        // Nếu người dùng không trả lời câu hỏi này, tính là sai
        answersResult.push({
          questionId: question.questionId,
          answerId: null, // Không có câu trả lời
          isCorrect: false,
        });
        continue;
      }

      // Kiểm tra câu trả lời đúng hay sai
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

    // Tính điểm dựa trên tổng số câu hỏi trong quiz (dưới 10 hoặc 10)
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

  async getUserQuizResults(user_id: string, quizzId: string) {
    const results = await this.quizzStoreRepository.findOne({
      where: {
        user: { user_id },
        quizz: { quizzId },
      },
      relations: ['quizz', 'user'],
    });

    if (!results) {
      throw new NotFoundException('Quiz results not found');
    }

    return results;
  }

  async getAllUserQuizResults(user_id: string) {
    const results = await this.quizzStoreRepository.find({
      where: {
        user: { user_id },
      },
      relations: ['quizz', 'user'],
      order: {
        createdAt: 'DESC',
      },
    });

    return results;
  }
}
