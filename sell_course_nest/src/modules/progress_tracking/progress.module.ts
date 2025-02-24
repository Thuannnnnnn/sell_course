import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../user/entities/user.entity';
import { ProgressTracking } from './entities/progress.entity';
import { Lesson } from '../lesson/entities/lesson.entity';
import { Contents } from '../contents/entities/contents.entity';
import { ProgressTrackingController } from './progressController.controller';
import { ProgressTrackingService } from './progressService.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, ProgressTracking, Lesson, Contents]),
  ],

  providers: [ProgressTrackingService],
  controllers: [ProgressTrackingController],
  exports: [ProgressTrackingService],
})
export class ProcessModule {}
