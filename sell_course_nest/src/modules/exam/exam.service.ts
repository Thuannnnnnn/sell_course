import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamQuestion } from './entities/examQuestion.entity';
import { Answer } from './entities/answerExam.entity';
import { Exam } from './entities/exam.entity';
import { CreateExamDto } from './dto/createExamData.dto';
import { v4 as uuidv4 } from 'uuid';
// import { UpdateExamDto } from './dto/updateExamData.dto';
import { UpdateQuestionDto } from './dto/updateQuestionData.dto';

@Injectable()
export class ExamQuestionService {
  constructor(
    @InjectRepository(ExamQuestion)
    private readonly questionRepository: Repository<ExamQuestion>,
    @InjectRepository(Answer)
    private readonly answerRepository: Repository<Answer>,
    @InjectRepository(Exam)
    private readonly examRepository: Repository<Exam>,
  ) {}

  async createExam(dto: CreateExamDto) {
    if (!dto.questions || dto.questions.length === 0) {
      throw new BadRequestException('No questions provided.');
    }

    let exam = await this.examRepository.findOne({
      where: { courseId: dto.courseId },
      relations: ['course'],
    });

    if (!exam) {
      exam = new Exam();
      exam.examId = uuidv4();
      exam.courseId = dto.courseId;
      exam = await this.examRepository.save(exam);
    }

    for (const questionDto of dto.questions) {
      if (!questionDto.question || questionDto.question.trim() === '') {
        throw new BadRequestException(
          `Invalid question: "${questionDto.question}"`,
        );
      }

      const question = new ExamQuestion();
      question.questionId = uuidv4();
      question.question = questionDto.question.trim();
      question.exam = exam;
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

        const answer = new Answer();
        answer.answerId = uuidv4();
        answer.answer = answerDto.answer.trim();
        answer.isCorrect = answerDto.isCorrect;
        answer.question = savedQuestion;
        await this.answerRepository.save(answer);
      }
    }

    return this.getExamById(exam.examId);
  }

  async getExamById(examId: string) {
    const exam = await this.examRepository.findOne({
      where: { examId },
      relations: ['questions', 'questions.answers'],
    });
    if (!exam) {
      throw new NotFoundException(`Exam with id ${examId} not found`);
    }
    return exam;
  }

  /*
   * async updateExam(examId: string, dto: UpdateExamDto) {
   *   const exam = await this.examRepository.findOne({
   *     where: { examId },
   *     relations: ['questions', 'questions.answers'],
   *   });
   */

  /*
   *   if (!exam) {
   *     throw new NotFoundException(`Exam with id ${examId} not found`);
   *   }
   */

  /*
   *   for (const questionDto of dto.questions) {
   *     let existingQuestion = exam.questions.find(
   *       (q) => q.questionId === questionDto.questionId,
   *     );
   */

  /*
   *     if (!existingQuestion) {
   *       existingQuestion = new ExamQuestion();
   *       existingQuestion.questionId = uuidv4();
   *       existingQuestion.exam = exam;
   *       exam.questions.push(existingQuestion);
   *     }
   */

  /*
   *     existingQuestion.question = questionDto.question.trim();
   *     await this.questionRepository.save(existingQuestion);
   */

  /*
   *     // Lấy danh sách câu trả lời từ database để đảm bảo dữ liệu đồng bộ
   *     existingQuestion.answers = await this.answerRepository.find({
   *       where: { question: existingQuestion },
   *     });
   */

  /*
   *     for (const answerDto of questionDto.answers) {
   *       let existingAnswer = existingQuestion.answers.find(
   *         (a) => a.answerId === answerDto.answerId,
   *       );
   */

  /*
   *       if (!existingAnswer) {
   *         existingAnswer = new Answer();
   *         existingAnswer.answerId = uuidv4();
   *         existingAnswer.question = existingQuestion;
   *         existingQuestion.answers.push(existingAnswer);
   *       }
   */

  /*
   *       existingAnswer.answer = answerDto.answer.trim();
   *       existingAnswer.isCorrect = answerDto.isCorrect;
   *       await this.answerRepository.save(existingAnswer);
   *     }
   *   }
   */

  /*
   *   return this.getExamById(examId);
   * }
   */

  async deleteExam(examId: string) {
    const exam = await this.examRepository.findOne({
      where: { examId },
      relations: ['questions', 'questions.answers'],
    });

    if (!exam) {
      throw new NotFoundException(`Exam with id ${examId} not found`);
    }

    // Xóa tất cả câu trả lời của bài kiểm tra
    for (const question of exam.questions) {
      await this.answerRepository.delete({
        question: { questionId: question.questionId },
      });
    }

    // Xóa tất cả câu hỏi của bài kiểm tra
    await this.questionRepository.delete({ exam: { examId } });

    // Xóa bài kiểm tra
    await this.examRepository.delete({ examId });

    return { message: `Exam with id ${examId} deleted successfully.` };
  }

  async deleteQuestion(questionId: string) {
    const question = await this.questionRepository.findOne({
      where: { questionId },
      relations: ['answers'],
    });

    if (!question) {
      throw new NotFoundException(`Question with id ${questionId} not found`);
    }

    // Xóa tất cả câu trả lời liên quan
    await this.answerRepository.delete({ question: { questionId } });

    // Xóa câu hỏi
    await this.questionRepository.delete({ questionId });

    return { message: `Question with id ${questionId} deleted successfully.` };
  }

  // ✅ Cập nhật từng câu hỏi theo `questionId`
  async updateQuestion(questionId: string, dto: UpdateQuestionDto) {
    const question = await this.questionRepository.findOne({
      where: { questionId },
      relations: ['answers'],
    });

    if (!question) {
      throw new NotFoundException(`Question with id ${questionId} not found`);
    }

    // Cập nhật nội dung câu hỏi
    question.question = dto.question.trim();
    await this.questionRepository.save(question);

    // Cập nhật danh sách câu trả lời
    for (const answerDto of dto.answers) {
      const existingAnswer = question.answers.find(
        (a) => a.answerId === answerDto.answerId,
      );

      if (existingAnswer) {
        // Nếu câu trả lời đã tồn tại, chỉ cập nhật nội dung
        existingAnswer.answer = answerDto.answer.trim();
        existingAnswer.isCorrect = answerDto.isCorrect;
        await this.answerRepository.save(existingAnswer);
      }
    }

    return this.getQuestionById(questionId);
  }

  // ✅ Lấy thông tin câu hỏi theo ID
  async getQuestionById(questionId: string) {
    const question = await this.questionRepository.findOne({
      where: { questionId },
      relations: ['answers'],
    });

    if (!question) {
      throw new NotFoundException(`Question with id ${questionId} not found`);
    }

    return question;
  }
}
