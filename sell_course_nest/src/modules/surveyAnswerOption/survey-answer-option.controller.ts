import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { SurveyAnswerOptionService } from './survey-answer-option.service';
import { CreateSurveyAnswerOptionDto } from './create-survey-answer-option.dto';

@Controller('survey-answer-options')
export class SurveyAnswerOptionController {
  constructor(private readonly optionService: SurveyAnswerOptionService) {}

  @Post()
  create(@Body() dto: CreateSurveyAnswerOptionDto) {
    return this.optionService.create(dto);
  }

  @Get()
  findAll() {
    return this.optionService.findAll();
  }

  @Get('by-question')
  findByQuestionId(@Query('questionId') questionId: string) {
    return this.optionService.findByQuestionId(questionId);
  }
}
