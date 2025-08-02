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
  UseGuards,
} from '@nestjs/common';
import { ExamQuestionService } from './exam.service';
import { CreateExamDto } from './dto/createExamData.dto';
import { UpdateQuestionDto } from './dto/updateQuestionData.dto';
import { CreateExamFromQuizzesDto } from '../../modules/exam/dto/createExamFromQuizzes.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '../Auth/user.enum';
import { Roles } from '../Auth/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../Auth/roles.guard';

@Controller('api')
export class ExamQuestionController {
  constructor(private readonly examQuestionService: ExamQuestionService) {}

  @ApiBearerAuth('Authorization')
  @Roles(UserRole.INSTRUCTOR)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
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
  @ApiBearerAuth('Authorization')
  @Roles(UserRole.INSTRUCTOR)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('/admin/exam/sync_with_quizzes/:courseId')
  async syncExamWithQuizzes(
    @Param('courseId', ParseUUIDPipe) courseId: string,
  ) {
    return this.examQuestionService.syncExamWithQuizzes(courseId);
  }

  /**
   * Get available quizzes for exam creation
   */
  @ApiBearerAuth('Authorization')
  @Roles(UserRole.INSTRUCTOR)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('/admin/exam/available_quizzes/:courseId')
  async getAvailableQuizzes(
    @Param('courseId', ParseUUIDPipe) courseId: string,
  ) {
    return this.examQuestionService.getAvailableQuizzesForExam(courseId);
  }

  /**
   * Create exam with custom questions (original functionality)
   */
  @ApiBearerAuth('Authorization')
  @Roles(UserRole.INSTRUCTOR)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('/admin/exam/create_exam')
  async createExamQuestions(@Body() dto: CreateExamDto) {
    return this.examQuestionService.createExam(dto);
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
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
  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('/admin/exam/stats/:courseId')
  async getExamStats(@Param('courseId', ParseUUIDPipe) courseId: string) {
    return this.examQuestionService.getExamStats(courseId);
  }

  /**
   * 🔧 NEW: Check if exam exists
   */
  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('/admin/exam/exists/:courseId')
  async checkExamExists(@Param('courseId', ParseUUIDPipe) courseId: string) {
    const exists = await this.examQuestionService.checkExamExists(courseId);
    return { exists };
  }

  /**
   * 🔧 NEW: Get exam for student view (without correct answers)
   */
  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('/student/exam/:courseId')
  async getExamForStudent(@Param('courseId', ParseUUIDPipe) courseId: string) {
    return this.examQuestionService.getExamForStudent(courseId);
  }

  /**
   * 🔧 NEW: Add single question to existing exam
   */
  @ApiBearerAuth('Authorization')
  @Roles(UserRole.INSTRUCTOR)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('/admin/exam/add_question/:courseId')
  async addQuestionToExam(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Body()
    questionData: {
      question: string;
      difficulty?: 'easy' | 'medium' | 'hard';
      weight?: number;
      answers: Array<{
        answer: string;
        isCorrect: boolean;
      }>;
    },
  ) {
    return this.examQuestionService.addQuestionToExam(courseId, questionData);
  }

  @ApiBearerAuth('Authorization')
  @Roles(UserRole.INSTRUCTOR)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete('/admin/exam/delete_question/:id')
  async deleteQuestion(@Param('id', ParseUUIDPipe) questionId: string) {
    return this.examQuestionService.deleteQuestion(questionId);
  }

  @ApiBearerAuth('Authorization')
  @Roles(UserRole.INSTRUCTOR)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete('/admin/exam/delete_exam/:id')
  async deleteExam(@Param('id', ParseUUIDPipe) examId: string) {
    return this.examQuestionService.deleteExam(examId);
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('/admin/exam/view_question/:id')
  async getQuestionById(@Param('id', ParseUUIDPipe) questionId: string) {
    return this.examQuestionService.getQuestionById(questionId);
  }
  @ApiBearerAuth('Authorization')
  @Roles(UserRole.INSTRUCTOR)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Put('/admin/exam/update_question/:id')
  async updateQuestion(
    @Param('id', ParseUUIDPipe) questionId: string,
    @Body() dto: UpdateQuestionDto,
  ) {
    return this.examQuestionService.updateQuestion(questionId, dto);
  }
}
