import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quizz } from './entities/quizz.entity';
import { Questionentity } from './entities/question.entity';
import { AnswerEntity } from './entities/answer.entity';
import { QuizzController } from './quizz.controller';
import { QuizzService } from './quizz.service';

@Module({
  imports: [TypeOrmModule.forFeature([Quizz, Questionentity, AnswerEntity])],
  controllers: [QuizzController],
  providers: [QuizzService],
  exports: [QuizzService],
})
export class QuizzModule {}
