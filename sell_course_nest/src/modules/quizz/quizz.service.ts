import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Quizz } from './entities/quizz.entity';
import { Questionentity } from './entities/question.entity';
import { AnswerEntity } from './entities/answer.entity';
import { CreateQuizzDto } from './dto/createQuizz.dto';

@Injectable()
export class QuizzService {
  constructor(
    @InjectRepository(Quizz)
    private readonly quizzRepository: Repository<Quizz>,
    @InjectRepository(Questionentity)
    private readonly questionRepository: Repository<Questionentity>,
    @InjectRepository(AnswerEntity)
    private readonly answerRepository: Repository<AnswerEntity>,
  ) {}

  async createQuizz(createQuizzDto: CreateQuizzDto) {
    // Create new quiz
    const quiz = new Quizz();
    quiz.quizzId = uuidv4();
    const savedQuiz = await this.quizzRepository.save(quiz);

    // Create questions and answers
    for (const questionDto of createQuizzDto.questions) {
      const question = new Questionentity();
      question.questionId = uuidv4();
      question.question = questionDto.question;
      question.quizz = savedQuiz;
      const savedQuestion = await this.questionRepository.save(question);

      // Create answers for the question
      for (const answerDto of questionDto.answers) {
        const answer = new AnswerEntity();
        answer.anwserId = uuidv4();
        answer.answer = answerDto.answer;
        answer.iscorrect = answerDto.isCorrect;
        answer.question = savedQuestion;
        await this.answerRepository.save(answer);
      }
    }

    // Return the created quiz with its questions and answers
    return this.getQuizById(quiz.quizzId);
  }

  async getQuizById(quizzId: string) {
    return this.quizzRepository.findOne({
      where: { quizzId },
      relations: ['questions', 'questions.answers'],
    });
  }
}
