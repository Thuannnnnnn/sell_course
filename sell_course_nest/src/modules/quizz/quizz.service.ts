import { Injectable, NotFoundException } from '@nestjs/common';
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
    const quiz = new Quizz();
    quiz.quizzId = uuidv4();
    quiz.contents = content;

    const savedQuiz = await this.quizzRepository.save(quiz);

    for (const questionDto of createQuizzDto.questions) {
      const question = new Questionentity();
      question.questionId = uuidv4();
      question.question = questionDto.question;
      question.quizz = savedQuiz;
      const savedQuestion = await this.questionRepository.save(question);

      for (const answerDto of questionDto.answers) {
        const answer = new AnswerEntity();
        answer.anwserId = uuidv4();
        answer.answer = answerDto.answer;
        answer.iscorrect = answerDto.isCorrect;
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
    const quiz = await this.quizzRepository.findOne({
      where: { quizzId },
      relations: ['questions', 'questions.answers'],
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${quizzId} not found`);
    }

    for (const question of quiz.questions) {
      await this.answerRepository.delete({
        question: { questionId: question.questionId },
      });
    }
    await this.questionRepository.delete({ quizz: { quizzId } });

    for (const questionDto of updateQuizzDto.questions) {
      const question = new Questionentity();
      question.questionId = questionDto.questionId || uuidv4();
      question.question = questionDto.question;
      question.quizz = quiz;
      const savedQuestion = await this.questionRepository.save(question);

      for (const answerDto of questionDto.answers) {
        const answer = new AnswerEntity();
        answer.anwserId = answerDto.anwserId || uuidv4();
        answer.answer = answerDto.answer;
        answer.iscorrect = answerDto.isCorrect;
        answer.question = savedQuestion;
        await this.answerRepository.save(answer);
      }
    }

    return this.getQuizById(quizzId);
  }

  async getRandomQuiz(quizzId: string, numberOfQuestions = 10) {
    const quiz = await this.quizzRepository.findOne({
      where: { quizzId },
      relations: ['contents', 'questions', 'questions.answers'],
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${quizzId} not found`);
    }

    if (quiz.questions.length < numberOfQuestions) {
      throw new NotFoundException(
        `Quiz only has ${quiz.questions.length} questions, cannot get ${numberOfQuestions} random questions`,
      );
    }

    // Shuffle questions array using Fisher-Yates algorithm
    const shuffledQuestions = [...quiz.questions];
    for (let i = shuffledQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledQuestions[i], shuffledQuestions[j]] = [
        shuffledQuestions[j],
        shuffledQuestions[i],
      ];
    }

    // Take first N questions
    const randomQuestions = shuffledQuestions.slice(0, numberOfQuestions);

    // Create new quiz object with random questions
    const randomQuiz = { ...quiz, questions: randomQuestions };
    return randomQuiz;
  }
}
