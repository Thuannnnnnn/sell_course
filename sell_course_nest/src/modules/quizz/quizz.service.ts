import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Quizz } from './entities/quizz.entity';
import { Questionentity } from './entities/question.entity';
import { AnswerEntity } from './entities/answer.entity';
import { CreateQuizzDto } from './dto/createQuizz.dto';
import { UpdateQuizzDto } from './dto/updateQuizz.dto';
import { Contents } from '../contents/entities/contents.entity';

@Injectable()
export class QuizzService {

  constructor(
    @InjectRepository(Quizz)
    private readonly quizzRepository: Repository<Quizz>,
    @InjectRepository(Questionentity)
    private readonly questionRepository: Repository<Questionentity>,
    @InjectRepository(AnswerEntity)
    private readonly answerRepository: Repository<AnswerEntity>,
    @InjectRepository(Contents)
    private readonly contentsRepository: Repository<Contents>,
  ) {}

  async createQuizz(createQuizzDto: CreateQuizzDto) {
    const content = await this.contentsRepository.findOne({
      where: { contentId: createQuizzDto.contentId },
    });

    if (!content) {
      throw new NotFoundException(
        `Content with ID ${createQuizzDto.contentId} not found`,
      );
    }

    let quiz = await this.quizzRepository.findOne({
      where: { contentId: createQuizzDto.contentId },
      relations: ['questions', 'questions.answers'],
    });

    if (!quiz) {
      quiz = new Quizz();
      quiz.quizzId = uuidv4();
      quiz.contentId = createQuizzDto.contentId;
      quiz.contents = content;
      quiz = await this.quizzRepository.save(quiz);
    }

    for (const questionDto of createQuizzDto.questions) {
      if (!questionDto.question || questionDto.question.trim() === '') {
        throw new BadRequestException(
          `Invalid question: "${questionDto.question}"`,
        );
      }

      const question = new Questionentity();
      question.questionId = uuidv4();
      question.question = questionDto.question.trim();
      question.quizz = quiz;
      const savedQuestion = await this.questionRepository.save(question);

      if (!questionDto.answers || questionDto.answers.length === 0) {
        throw new BadRequestException(
          `No answers provided for question: "${questionDto.question}"`,
        );
      }

      for (const answerDto of questionDto.answers) {
        if (!answerDto.answer || answerDto.answer.trim() === '') {
          throw new BadRequestException('Invalid answer text');
        }

        const answer = new AnswerEntity();
        answer.answerId = uuidv4();
        answer.answer = answerDto.answer.trim();
        answer.isCorrect = answerDto.isCorrect;
        answer.question = savedQuestion;
        await this.answerRepository.save(answer);
      }
    }

    return this.getQuizById(quiz.quizzId);
  }

  async getQuizById(quizzId: string) {
    const quiz = await this.quizzRepository.findOne({
      where: { quizzId },
      relations: ['contents', 'questions', 'questions.answers'],
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${quizzId} not found`);
    }

    return quiz;
  }

  async getQuizzesByContentId(contentId: string) {
    const quizzes = await this.quizzRepository.find({
      where: { contents: { contentId: contentId } },
      relations: ['contents', 'questions', 'questions.answers'],
    });

    return quizzes;
  }

  async updateQuizz(quizzId: string, updateQuizzDto: UpdateQuizzDto) {
    if (!quizzId || typeof quizzId !== 'string') {
      throw new BadRequestException('Quiz ID must be a valid string');
    }

    const quiz = await this.quizzRepository.findOne({
      where: { quizzId },
      relations: ['questions', 'questions.answers'],
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${quizzId} not found`);
    }

    for (const questionDto of updateQuizzDto.questions) {
      let question: Questionentity;

      if (questionDto.questionId) {
        if (typeof questionDto.questionId !== 'string') {
          throw new BadRequestException('Question ID must be a valid string');
        }

        question = await this.questionRepository.findOne({
          where: { questionId: questionDto.questionId },
          relations: ['answers'],
        });

        if (!question) {
          throw new NotFoundException(
            `Question with ID ${questionDto.questionId} not found`,
          );
        }

        question.question = questionDto.question;
        await this.questionRepository.save(question);
      } else {
        question = new Questionentity();
        question.questionId = uuidv4();
        question.question = questionDto.question;
        question.quizz = quiz;
        await this.questionRepository.save(question);
      }

      for (const answerDto of questionDto.answers) {
        let answer: AnswerEntity;

        if (answerDto.answerId) {
          if (typeof answerDto.answerId !== 'string') {
            throw new BadRequestException('Answer ID must be a valid string');
          }

          answer = await this.answerRepository.findOne({
            where: { answerId: answerDto.answerId },
          });

          if (!answer) {
            throw new NotFoundException(
              `Answer with ID ${answerDto.answerId} not found`,
            );
          }

          answer.answer = answerDto.answer;
          answer.isCorrect = answerDto.isCorrect;
          await this.answerRepository.save(answer);
        } else {
          answer = new AnswerEntity();
          answer.answerId = uuidv4();
          answer.answer = answerDto.answer;
          answer.isCorrect = answerDto.isCorrect;
          answer.question = question;
          await this.answerRepository.save(answer);
        }
      }
    }

    return this.getQuizById(quizzId);
  }

  async getRandomQuiz(
    contentId: string,
    quizzId?: string,
    numberOfQuestions = 10,
  ) {
    const quizzes = await this.getQuizzesByContentId(contentId);

    if (!quizzes.length) {
      throw new NotFoundException(
        `No quizzes found for content ID ${contentId}`,
      );
    }

    const quiz = quizzId
      ? quizzes.find((q) => q.quizzId === quizzId)
      : quizzes[0];

    if (!quiz) {
      throw new NotFoundException(
        `Quiz ID ${quizzId} không thuộc content ID ${contentId}`,
      );
    }

    const shuffledQuestions = quiz.questions.sort(() => Math.random() - 0.5);
    const actualNumberOfQuestions = Math.min(
      quiz.questions.length,
      numberOfQuestions,
    );

    return {
      ...quiz,
      questions: shuffledQuestions.slice(0, actualNumberOfQuestions),
    };
  }

  async deleteQuestion(quizzId: string, questionId: string) {
    const quiz = await this.quizzRepository.findOne({
      where: { quizzId },
      relations: ['questions', 'questions.answers', 'contents'],
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${quizzId} not found`);
    }

    const question = await this.questionRepository.findOne({
      where: {
        questionId,
        quizz: { quizzId },
      },
      relations: ['answers'],
    });

    if (!question) {
      throw new NotFoundException(
        `Question with ID ${questionId} not found in Quiz ${quizzId}`,
      );
    }

    await this.answerRepository.delete({ question: { questionId } });

    await this.questionRepository.delete({ questionId });

    return {
      message: `Question with ID ${questionId} has been deleted from Quiz ${quizzId}`,
    };
  }

  async deleteQuiz(contentId: string, quizzId?: string) {
    const queryRunner =
      this.quizzRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Tìm quiz dựa trên contentId
      const quiz = await this.quizzRepository.findOne({
        where: {
          contents: { contentId }, // Tìm quiz dựa trên contentId trong bảng quan hệ
        },
        relations: ['questions', 'questions.answers', 'contents'],
      });

      if (!quiz) {
        throw new NotFoundException(
          `No quiz found for content ID ${contentId}`,
        );
      }

      // Nếu có quizzId được truyền vào, kiểm tra xem nó có khớp không
      if (quizzId && quiz.quizzId !== quizzId) {
        throw new BadRequestException(
          `Quiz ID ${quizzId} does not match the quiz associated with content ID ${contentId}`,
        );
      }

      // Xóa các answers liên quan
      for (const question of quiz.questions) {
        await this.answerRepository.delete({
          question: { questionId: question.questionId },
        });
      }

      // Xóa các questions liên quan
      await this.questionRepository.delete({
        quizz: { quizzId: quiz.quizzId },
      });

      // Xóa quiz khỏi bảng quizz_store (nếu có)
      await queryRunner.manager.query(
        'DELETE FROM quizz_store WHERE quizz_id = $1',
        [quiz.quizzId],
      );

      // Xóa quiz chính
      await queryRunner.manager.delete(Quizz, { quizzId: quiz.quizzId });

      await queryRunner.commitTransaction();

      return {
        message: `Quiz with ID ${quiz.quizzId} and all related questions and answers have been deleted`,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
