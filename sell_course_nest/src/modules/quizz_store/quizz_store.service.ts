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
import { QuizUtils } from '../quizz/utils/quiz.utils';
import { AnswerResult, QuizFeedback } from './interfaces/score-analysis.interface';

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

  async submitQuiz(
    user_id: string, 
    submitQuizDto: SubmitQuizDto, 
    courseId: string, 
    lessonId: string, 
    contentId: string
  ) {
    if (!submitQuizDto.quizzId) {
      throw new BadRequestException('quizzId is required');
    }

    const user = await this.userRepository.findOne({ where: { user_id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${user_id} not found`);
    }

    const quiz = await this.quizzRepository.findOne({
      where: { 
        quizzId: submitQuizDto.quizzId,
        courseId,
        lessonId,
        contentId
      },
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

    const answersResult: AnswerResult[] = [];
    const feedback: QuizFeedback[] = [];

    // Process all questions, including unanswered ones
    for (const question of quiz.questions) {
      const submission = submitQuizDto.answers?.find(
        (a) => a.questionId === question.questionId,
      );

      let isCorrect = false;
      let selectedAnswerId: string | null = null;
      let correctAnswer = '';
      let userAnswer = '';

      if (submission && submission.answerId) {
        // Validate submitted answer
        const validAnswer = question.answers.find(
          (a) => a.answerId === submission.answerId,
        );
        if (!validAnswer) {
          throw new BadRequestException(
            `Answer with ID ${submission.answerId} is invalid for question ${submission.questionId}`,
          );
        }

        selectedAnswerId = submission.answerId;
        isCorrect = validAnswer.isCorrect;
        userAnswer = validAnswer.answer;
      }

      // Find correct answer for feedback
      const correctAnswerEntity = question.answers.find(a => a.isCorrect);
      correctAnswer = correctAnswerEntity ? correctAnswerEntity.answer : '';

      // Add to results
      answersResult.push({
        questionId: question.questionId,
        answerId: selectedAnswerId,
        isCorrect,
      });

      // Generate feedback
      feedback.push({
        questionId: question.questionId,
        userAnswer: userAnswer || null,
        correctAnswer,
        isCorrect,
        difficulty: question.difficulty || 'medium',
        weight: question.weight || 1,
      });
    }

    // Validate submitted answers belong to quiz
    if (submitQuizDto.answers) {
      for (const submission of submitQuizDto.answers) {
        if (!validQuestionIds.includes(submission.questionId)) {
          throw new BadRequestException(
            `Invalid question ID: ${submission.questionId}. It must belong to quiz ${submitQuizDto.quizzId}`,
          );
        }
      }
    }

    // Calculate detailed score using new system
    const scoreResult = QuizUtils.calculateScore(answersResult, quiz.questions);
    const detailedAnalysis = QuizUtils.analyzePerformance(answersResult, quiz.questions);

    const quizStore = this.quizzStoreRepository.create({
      storeId: uuidv4(),
      user,
      quizz: quiz,
      score: scoreResult.percentage,
      answers: answersResult,
      scoreAnalysis: scoreResult,
      detailedAnalysis,
      feedback,
    });

    return this.quizzStoreRepository.save(quizStore);
  }



  async getUserQuizResults(
    user_id: string,
    quizzId: string,
    contentId: string,
    courseId: string,
    lessonId: string,
  ) {
    const results = await this.quizzStoreRepository.findOne({
      where: {
        user: { user_id },
        quizz: { quizzId, contentId, courseId, lessonId },
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

  async getUserQuizResultsByCourse(user_id: string, courseId: string) {
    const results = await this.quizzStoreRepository.find({
      where: {
        user: { user_id },
        quizz: { courseId },
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

  async getUserQuizResultsByLesson(user_id: string, courseId: string, lessonId: string) {
    const results = await this.quizzStoreRepository.find({
      where: {
        user: { user_id },
        quizz: { courseId, lessonId },
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

  async getUserQuizResultsByContent(user_id: string, contentId: string, courseId: string, lessonId: string) {
    const results = await this.quizzStoreRepository.find({
      where: {
        user: { user_id },
        quizz: { contentId, courseId, lessonId },
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

  async getDetailedQuizAnalysis(
    user_id: string,
    quizzId: string,
    contentId: string,
    courseId: string,
    lessonId: string,
  ) {
    const result = await this.quizzStoreRepository.findOne({
      where: {
        user: { user_id },
        quizz: { quizzId, contentId, courseId, lessonId },
      },
      relations: ['quizz', 'user', 'quizz.contents', 'quizz.questions'],
    });

    if (!result) {
      throw new NotFoundException('Quiz results not found');
    }

    return {
      basicInfo: {
        quizzId: result.quizz.quizzId,
        contentId: result.quizz.contentId,
        userId: result.user.user_id,
        completedAt: result.createdAt,
        score: result.score,
      },
      scoreAnalysis: result.scoreAnalysis,
      detailedAnalysis: result.detailedAnalysis,
      feedback: result.feedback,
    };
  }


}
