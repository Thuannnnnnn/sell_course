import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAnswerController } from './userAnswer.controller';
import { UserAnswerService } from './userAnswer.service';
import { UserAnswer } from './entities/userAnswer.entity';
import { QuestionHabit } from '../questionHabit/entities/questionHabit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserAnswer, QuestionHabit])],
  controllers: [UserAnswerController],
  providers: [UserAnswerService],
  exports: [UserAnswerService],
})
export class UserAnswerModule {}
