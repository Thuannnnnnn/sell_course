import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { User } from '../user/entities/user.entity';
import { Course } from '../course/entities/course.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { Category } from '../category/entities/category.entity';
import { Exam } from '../exam/entities/exam.entity';
import { ResultExam } from '../result_exam/entities/result_exam.entity';
import { ProgressTracking } from '../progress_tracking/entities/progress.entity';
import { Promotion } from '../promotion/entities/promotion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Course,
      Enrollment,
      Category,
      Exam,
      ResultExam,
      ProgressTracking,
      Promotion,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
