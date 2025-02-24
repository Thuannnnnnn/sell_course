import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { QuizzStoreService } from './quizz_store.service';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';

@Controller('api/quizzStore')
@UseGuards(JwtAuthGuard)
export class QuizzStoreController {
  constructor(private readonly quizzStoreService: QuizzStoreService) {}

  @Post('submit')
  async submitQuiz(@Request() req, @Body() submitQuizDto: SubmitQuizDto) {
    return this.quizzStoreService.submitQuiz(req.user.userId, submitQuizDto);
  }

  @Get('results/:contentId/:quizzId')
  async getQuizResults(
    @Request() req,
    @Param('contentId') contentId: string,
    @Param('quizzId') quizzId: string,
  ) {
    return this.quizzStoreService.getUserQuizResults(req.user.userId, quizzId, contentId);
  }
  
  @Get('results')
  async getAllResults(@Request() req) {
    return this.quizzStoreService.getAllUserQuizResults(req.user.userId);
  }

  @Get('results/content/:contentId')
  async getResultsByContent(@Request() req, @Param('contentId') contentId: string) {
    const allResults = await this.quizzStoreService.getAllUserQuizResults(req.user.userId);
    return allResults.filter(result => result.quizz.contentId === contentId);
  }
}
