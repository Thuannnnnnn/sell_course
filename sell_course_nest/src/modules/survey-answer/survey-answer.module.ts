import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SurveyAnswer } from './survey-answer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SurveyAnswer])],
  providers: [],
  controllers: [],
  exports: [],
})
export class SurveyAnswerModule {}
