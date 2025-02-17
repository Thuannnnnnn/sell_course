import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { QuizzService } from './quizz.service';
import { CreateQuizzDto } from './dto/createQuizz.dto';

@Controller('api/quizz')
export class QuizzController {
  constructor(private readonly quizzService: QuizzService) {}

  @Post()
  async createQuizz(@Body() createQuizzDto: CreateQuizzDto) {
    return this.quizzService.createQuizz(createQuizzDto);
  }

  @Get(':id')
  async getQuizz(@Param('id') id: string) {
    return this.quizzService.getQuizById(id);
  }
}
