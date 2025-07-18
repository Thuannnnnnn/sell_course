import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SurveyAnswerOptionService } from './survey-answer-option.service';
import { SurveyAnswerOptionController } from './survey-answer-option.controller';
import { SurveyQuestion } from '../survey-response/survey-response.entity';
import { SurveyAnswerOption } from './survey-answer-option.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SurveyAnswerOption, SurveyQuestion])],
  providers: [SurveyAnswerOptionService],
  controllers: [SurveyAnswerOptionController],
})
export class SurveyAnswerOptionModule {}
