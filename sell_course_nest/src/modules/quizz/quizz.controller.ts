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
  UseGuards,
} from '@nestjs/common';
import { QuizzService } from './quizz.service';
import { CreateQuizzDto } from './dto/createQuizz.dto';
import { UpdateQuizzDto } from './dto/updateQuizz.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../Auth/roles.decorator';
import { UserRole } from '../Auth/user.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../Auth/roles.guard';

// Controller cho Admin API
@Controller(
  'api/instructor/courses/:courseId/lessons/:lessonId/contents/:contentId/quizzes',
)
export class AdminQuizzController {
  constructor(private readonly quizzService: QuizzService) {}

  @ApiBearerAuth('Authorization')
  @Roles(UserRole.INSTRUCTOR)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post()
  async createQuizz(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Param('contentId', ParseUUIDPipe) contentId: string,
    @Body() createQuizzDto: CreateQuizzDto,
  ) {
    createQuizzDto.contentId = contentId;
    return this.quizzService.createQuizz(createQuizzDto, courseId, lessonId);
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get(':quizId')
  async getQuizz(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Param('contentId', ParseUUIDPipe) contentId: string,
    @Param('quizId', ParseUUIDPipe) quizId: string,
  ) {
    return this.quizzService.getQuizById(quizId, courseId, lessonId, contentId);
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
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

  @ApiBearerAuth('Authorization')
  @Roles(UserRole.INSTRUCTOR)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
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

  @ApiBearerAuth('Authorization')
  @Roles(UserRole.INSTRUCTOR)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
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

  @ApiBearerAuth('Authorization')
  @Roles(UserRole.INSTRUCTOR)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
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

  @ApiBearerAuth('Authorization')
  @Roles(UserRole.INSTRUCTOR)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
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

@Controller(
  'api/courses/:courseId/lessons/:lessonId/contents/:contentId/quizzes',
)
export class QuizzController {
  constructor(private readonly quizzService: QuizzService) {}
  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
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
  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get(':quizId')
  async getQuiz(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Param('contentId', ParseUUIDPipe) contentId: string,
    @Param('quizId', ParseUUIDPipe) quizId: string,
  ) {
    return this.quizzService.getQuizById(quizId, courseId, lessonId, contentId);
  }
}
