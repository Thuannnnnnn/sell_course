import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { QuizzService } from './quizz.service';
import { CreateQuizzDto } from './dto/createQuizz.dto';
import { UpdateQuizzDto } from './dto/updateQuizz.dto';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';

@Controller('api')
export class QuizzController {
  constructor(private readonly quizzService: QuizzService) {}

  @Post('/admin/quizzcreate')
  async createQuizz(@Body() createQuizzDto: CreateQuizzDto) {
    return this.quizzService.createQuizz(createQuizzDto);
  }

  @Get('/admin/quizz:id')
  async getQuizz(@Param('id') id: string) {
    return this.quizzService.getQuizById(id);
  }

  @Get('/admin/quizz/content/:id')
  async getQuizzesByContentId(@Param('id') id: string) {
    return this.quizzService.getQuizzesByContentId(id);
  }

  @Put('/admin/quizz/update/:id')
  async updateQuizz(
    @Param('id') id: string,
    @Body() updateQuizzDto: UpdateQuizzDto,
  ) {
    return this.quizzService.updateQuizz(id, updateQuizzDto);
  }

  @Get('/quizz/random/:id/')
  async getRandomQuiz(@Param('id') id: string) {
    const numberOfQuestions = 10;
    return this.quizzService.getRandomQuiz(id, numberOfQuestions);
  }

  @Delete('/admin/quizz/:quizzId/question/:questionId')
  async deleteQuestion(
    @Param('quizzId') quizzId: string,
    @Param('questionId') questionId: string,
  ) {
    return this.quizzService.deleteQuestion(quizzId, questionId);
  }
}
