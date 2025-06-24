import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { QuizzStoreService } from './quizz_store.service';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';

@Controller(
  'api/courses/:courseId/lessons/:lessonId/contents/:contentId/quizzes',
)
@UseGuards(JwtAuthGuard)
export class QuizzStoreController {
  constructor(private readonly quizzStoreService: QuizzStoreService) {}

  @Post(':quizId/submit')
  async submitQuiz(
    @Request() req,
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Param('contentId', ParseUUIDPipe) contentId: string,
    @Param('quizId', ParseUUIDPipe) quizId: string,
    @Body() submitQuizDto: SubmitQuizDto,
  ) {
    // Đảm bảo quizId từ URL được sử dụng
    submitQuizDto.quizzId = quizId;
    return this.quizzStoreService.submitQuiz(
      req.user.userId, 
      submitQuizDto, 
      courseId, 
      lessonId, 
      contentId,
    );
  }

  @Get(':quizId/results')
  async getQuizResults(
    @Request() req,
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Param('contentId', ParseUUIDPipe) contentId: string,
    @Param('quizId', ParseUUIDPipe) quizId: string,
  ) {
    return this.quizzStoreService.getUserQuizResults(
      req.user.userId,
      quizId,
      contentId,
      courseId,
      lessonId,
    );
  }

  @Get(':quizId/detailed-analysis')
  async getDetailedAnalysis(
    @Request() req,
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Param('contentId', ParseUUIDPipe) contentId: string,
    @Param('quizId', ParseUUIDPipe) quizId: string,
  ) {
    return this.quizzStoreService.getDetailedQuizAnalysis(
      req.user.userId,
      quizId,
      contentId,
      courseId,
      lessonId,
    );
  }

  @Get('results')
  async getResultsByContent(
    @Request() req,
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Param('contentId', ParseUUIDPipe) contentId: string,
  ) {
    return this.quizzStoreService.getUserQuizResultsByContent(
      req.user.userId,
      contentId,
      courseId,
      lessonId,
    );
  }
}

// Controller riêng cho việc lấy tất cả kết quả quiz của người dùng
@Controller('api/user/quiz-results')
@UseGuards(JwtAuthGuard)
export class UserQuizResultsController {
  constructor(private readonly quizzStoreService: QuizzStoreService) {}

  @Get()
  async getAllResults(@Request() req) {
    return this.quizzStoreService.getAllUserQuizResults(req.user.userId);
  }

  @Get('courses/:courseId')
  async getResultsByCourse(
    @Request() req,
    @Param('courseId', ParseUUIDPipe) courseId: string,
  ) {
    return this.quizzStoreService.getUserQuizResultsByCourse(
      req.user.userId,
      courseId,
    );
  }

  @Get('courses/:courseId/lessons/:lessonId')
  async getResultsByLesson(
    @Request() req,
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
  ) {
    return this.quizzStoreService.getUserQuizResultsByLesson(
      req.user.userId,
      courseId,
      lessonId,
    );
  }
}
