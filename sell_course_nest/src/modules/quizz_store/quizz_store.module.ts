import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizzStoreController } from './quizz_store.controller';
import { QuizzStoreService } from './quizz_store.service';
import { QuizzStore } from './entities/quizz_store.entity';
import { Quizz } from '../quizz/entities/quizz.entity';
import { User } from '../user/entities/user.entity';
import { Questionentity } from '../quizz/entities/question.entity';
import { AnswerEntity } from '../quizz/entities/answer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QuizzStore,
      Quizz,
      User,
      Questionentity,
      AnswerEntity,
    ]),
  ],
  controllers: [QuizzStoreController],
  providers: [QuizzStoreService],
  exports: [QuizzStoreService],
})
export class QuizzStoreModule {}
