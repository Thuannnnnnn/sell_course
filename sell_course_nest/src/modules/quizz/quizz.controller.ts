import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { QuizzService } from './quizz.service';
import { CreateQuizzDto } from './dto/createQuizz.dto';
import { UpdateQuizzDto } from './dto/updateQuizz.dto';

// Controller cho Admin API
@Controller(
  'api/instructor/courses/:courseId/lessons/:lessonId/contents/:contentId/quizzes',
)
export class AdminQuizzController {
  constructor(private readonly quizzService: QuizzService) {}

  @Post()
  async createQuizz(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Param('contentId', ParseUUIDPipe) contentId: string,
    @Body() createQuizzDto: CreateQuizzDto,
  ) {
    // Đảm bảo contentId từ URL được sử dụng
    createQuizzDto.contentId = contentId;
    return this.quizzService.createQuizz(createQuizzDto, courseId, lessonId);
  }

  @Get(':quizId')
  async getQuizz(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Param('contentId', ParseUUIDPipe) contentId: string,
    @Param('quizId', ParseUUIDPipe) quizId: string,
  ) {
    return this.quizzService.getQuizById(quizId, courseId, lessonId, contentId);
  }

  @Get()
  async getQuizzesByContentId(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Param('contentId', ParseUUIDPipe) contentId: string,
  ) {
    return this.quizzService.getQuizzesByContentId(
      contentId,
      courseId,
      lessonId,
    );
  }

  @Put(':quizId')
  async updateQuizz(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Param('contentId', ParseUUIDPipe) contentId: string,
    @Param('quizId', ParseUUIDPipe) quizId: string,
    @Body() updateQuizzDto: UpdateQuizzDto,
  ) {
    return this.quizzService.updateQuizz(
      quizId,
      updateQuizzDto,
      courseId,
      lessonId,
      contentId,
    );
  }

  @Delete(':quizId/questions/:questionId')
  async deleteQuestion(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Param('contentId', ParseUUIDPipe) contentId: string,
    @Param('quizId', ParseUUIDPipe) quizId: string,
    @Param('questionId', ParseUUIDPipe) questionId: string,
  ) {
    return this.quizzService.deleteQuestion(
      quizId,
      questionId,
      courseId,
      lessonId,
      contentId,
    );
  }

  @Delete(':quizId/questions')
  async deleteAllQuestions(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Param('contentId', ParseUUIDPipe) contentId: string,
    @Param('quizId', ParseUUIDPipe) quizId: string,
  ) {
    return this.quizzService.deleteAllQuestions(
      quizId,
      courseId,
      lessonId,
      contentId,
    );
  }

  @Delete(':quizId')
  async deleteQuizz(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Param('contentId', ParseUUIDPipe) contentId: string,
    @Param('quizId', ParseUUIDPipe) quizId: string,
  ) {
    return this.quizzService.deleteQuiz(contentId, quizId, courseId, lessonId);
  }
}

// Controller cho User API
@Controller(
  'api/courses/:courseId/lessons/:lessonId/contents/:contentId/quizzes',
)
export class QuizzController {
  constructor(private readonly quizzService: QuizzService) {}

  @Get('random')
  async getRandomQuiz(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Param('contentId', ParseUUIDPipe) contentId: string,
    @Query('quizId') quizId?: string,
  ) {
    const numberOfQuestions = 10;
    return this.quizzService.getRandomQuiz(
      contentId,
      quizId,
      numberOfQuestions,
      courseId,
      lessonId,
    );
  }
}
