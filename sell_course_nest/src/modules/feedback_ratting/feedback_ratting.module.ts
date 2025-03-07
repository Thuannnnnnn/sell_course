import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackRattingService } from './feedback_ratting.service';
import { FeedbackRattingController } from './feedback_ratting.controller';
import { FeedbackRatting } from './entities/feedback_ratting.entity';
import { User } from '../user/entities/user.entity';
import { Course } from '../course/entities/course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FeedbackRatting, User, Course])],
  controllers: [FeedbackRattingController],
  providers: [FeedbackRattingService],
})
export class FeedbackRattingModule {}
