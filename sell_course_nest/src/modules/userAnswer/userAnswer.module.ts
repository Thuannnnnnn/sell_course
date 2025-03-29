import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAnswerController } from './userAnswer.controller';
import { UserAnswerService } from './userAnswer.service';
import { UserAnswer } from './entities/userAnswer.entity';
import { QuestionHabit } from '../questionHabit/entities/questionHabit.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserAnswer, QuestionHabit, User])],
  controllers: [UserAnswerController],
  providers: [UserAnswerService],
  exports: [UserAnswerService],
})
export class UserAnswerModule {}
