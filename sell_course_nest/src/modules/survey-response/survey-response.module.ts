import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SurveyQuestion } from './survey-response.entity';
import { SurveyAnswerOption } from '../surveyAnswerOption/survey-answer-option.entity';
import { SurveyQuestionService } from './survey-question.service';
import { SurveyQuestionController } from './survey-question.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SurveyQuestion, SurveyAnswerOption])],
  providers: [SurveyQuestionService],
  controllers: [SurveyQuestionController],
})
export class SurveyQuestionModule {}
