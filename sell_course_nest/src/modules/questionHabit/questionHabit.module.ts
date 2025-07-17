import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { QuestionHabit } from '../questionHabit/entities/questionHabit.entity';
import { QuestionHabitService } from './questionHabit.service';
import { QuestionHabitController } from './questionHabit.controller';

@Module({
  imports: [TypeOrmModule.forFeature([QuestionHabit])],
  controllers: [QuestionHabitController],
  providers: [QuestionHabitService],
  exports: [QuestionHabitService],
})
export class QuestionHabitModule {}
