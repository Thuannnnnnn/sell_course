import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SurveyResponse } from './survey-response.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SurveyResponse])],
  providers: [],
  controllers: [],
  exports: [],
})
export class SurveyResponseModule {}
