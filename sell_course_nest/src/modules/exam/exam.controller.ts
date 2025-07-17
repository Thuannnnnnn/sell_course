import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  NotFoundException,
  Put,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ExamQuestionService } from './exam.service';
import { CreateExamDto } from './dto/createExamData.dto';
import { UpdateQuestionDto } from './dto/updateQuestionData.dto';
import { CreateExamFromQuizzesDto } from '../../modules/exam/dto/createExamFromQuizzes.dto';

@Controller('api')
export class ExamQuestionController {
  constructor(private readonly examQuestionService: ExamQuestionService) {}

  /**
   * Create exam from quiz questions in a course
   */
  @Post('/admin/exam/create_from_quizzes')
  async createExamFromQuizzes(@Body() dto: CreateExamFromQuizzesDto) {
    return this.examQuestionService.createExamFromQuizzes(dto.courseId, {
      questionsPerQuiz: dto.questionsPerQuiz,
      totalQuestions: dto.totalQuestions,
      includeAllQuizzes: dto.includeAllQuizzes,
      specificQuizIds: dto.specificQuizIds,
    });
  }

  /**
   * Sync exam with latest quiz questions
   */
  @Post('/admin/exam/sync_with_quizzes/:courseId')
  async syncExamWithQuizzes(@Param('courseId', ParseUUIDPipe) courseId: string) {
    return this.examQuestionService.syncExamWithQuizzes(courseId);
  }

  /**
   * Get available quizzes for exam creation
   */
  @Get('/admin/exam/available_quizzes/:courseId')
  async getAvailableQuizzes(@Param('courseId', ParseUUIDPipe) courseId: string) {
    return this.examQuestionService.getAvailableQuizzesForExam(courseId);
  }

  /**
   * Create exam with custom questions (original functionality)
   */
  @Post('/admin/exam/create_exam')
  async createExamQuestions(@Body() dto: CreateExamDto) {
    return this.examQuestionService.createExam(dto);
  }

  /**
   * Get exam by course ID
   */
  @Get('/admin/exam/view_exam/:id')
  async getAllExamById(@Param('id', ParseUUIDPipe) courseId: string) {
    const exam = await this.examQuestionService.getExamById(courseId);
    if (!exam) {
      throw new NotFoundException(`Exam with id ${courseId} not found`);
    }
    return exam;
  }

  /**
   * 🔧 NEW: Get exam statistics
   */
  @Get('/admin/exam/stats/:courseId')
  async getExamStats(@Param('courseId', ParseUUIDPipe) courseId: string) {
    return this.examQuestionService.getExamStats(courseId);
  }

  /**
   * 🔧 NEW: Check if exam exists
   */
  @Get('/admin/exam/exists/:courseId')
  async checkExamExists(@Param('courseId', ParseUUIDPipe) courseId: string) {
    const exists = await this.examQuestionService.checkExamExists(courseId);
    return { exists };
  }

  /**
   * 🔧 NEW: Get exam for student view (without correct answers)
   */
  @Get('/student/exam/:courseId')
  async getExamForStudent(@Param('courseId', ParseUUIDPipe) courseId: string) {
    return this.examQuestionService.getExamForStudent(courseId);
  }

  /**
   * 🔧 NEW: Add single question to existing exam
   */
  @Post('/admin/exam/add_question/:courseId')
  async addQuestionToExam(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Body() questionData: {
      question: string;
      difficulty?: 'easy' | 'medium' | 'hard';
      weight?: number;
      answers: Array<{
        answer: string;
        isCorrect: boolean;
      }>;
    }
  ) {
    return this.examQuestionService.addQuestionToExam(courseId, questionData);
  }

  /**
   * Delete question from exam
   */
  @Delete('/admin/exam/delete_question/:id')
  async deleteQuestion(@Param('id', ParseUUIDPipe) questionId: string) {
    return this.examQuestionService.deleteQuestion(questionId);
  }

  /**
   * Delete entire exam
   */
  @Delete('/admin/exam/delete_exam/:id')
  async deleteExam(@Param('id', ParseUUIDPipe) examId: string) {
    return this.examQuestionService.deleteExam(examId);
  }

  /**
   * Get question by ID
   */
  @Get('/admin/exam/view_question/:id')
  async getQuestionById(@Param('id', ParseUUIDPipe) questionId: string) {
    return this.examQuestionService.getQuestionById(questionId);
  }

  /**
   * Update question
   */
  @Put('/admin/exam/update_question/:id')
  async updateQuestion(
    @Param('id', ParseUUIDPipe) questionId: string,
    @Body() dto: UpdateQuestionDto,
  ) {
    return this.examQuestionService.updateQuestion(questionId, dto);
  }
}