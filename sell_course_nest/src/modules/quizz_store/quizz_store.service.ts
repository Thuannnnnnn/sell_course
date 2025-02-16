import { Injectable, NotFoundException, Delete } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { QuizzStore } from './entities/quizz_store.entity';
import { Quizz } from '../quizz/entities/quizz.entity';
import { User } from '../user/entities/user.entity';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

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

    let score = 0;
    const answersResult = [];

    for (const submission of submitQuizDto.answers) {
      console.log('Processing submission:', submission);

      const question = quiz.questions.find(
        (q) => q.questionId === submission.questionId,
      );
      if (!question) {
        continue;
      }

      const selectedAnswer = question.answers.find(
        (a) => a.anwserId === submission.anwserId,
      );
      if (!selectedAnswer) {
        continue;
      }

      const isCorrect = selectedAnswer.iscorrect;
      if (isCorrect) {
        score++;
      }

      answersResult.push({
        questionId: submission.questionId,
        anwserId: submission.anwserId,
        isCorrect,
      });
    }

    const totalQuestions = quiz.questions.length;
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
