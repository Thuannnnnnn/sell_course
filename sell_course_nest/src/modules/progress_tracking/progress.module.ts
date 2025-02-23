import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../user/entities/user.entity';
import { ProgressTracking } from './entities/progress.entity';
import { Lesson } from '../lesson/entities/lesson.entity';
import { Contents } from '../contents/entities/contents.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, ProgressTracking, Lesson, Contents]),
  ],

  providers: [],
  controllers: [],
})
export class CourseModule {}
