import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { SurveyQuestionService } from './survey-question.service';
import {
  CreateSurveyQuestionDto,
  UpdateSurveyQuestionWithOptionsDto,
} from './create-survey-question-with-options.dto';

@Controller('survey-questions')
export class SurveyQuestionController {
  constructor(private readonly questionService: SurveyQuestionService) {}

  @Post()
  create(@Body() dto: CreateSurveyQuestionDto[]) {
    return this.questionService.createMany(dto);
  }

  @Get()
  findAll() {
    return this.questionService.findAll();
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSurveyQuestionWithOptionsDto,
  ) {
    return this.questionService.updateQuestionWithOptions(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionService.deleteQuestion(id);
  }
}
