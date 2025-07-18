import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningPlan } from './learning-plan.entity';
import { LearningPlanService } from './learning-plan.service';
import { LearningPlanController } from './learning-plan.controller';
import { User } from '../user/entities/user.entity';
import { Course } from '../course/entities/course.entity';
import { PlanConstraint } from '../plan-constraint/plan-constraint.entity';
import { PlanPreference } from '../plan-preference/plan-preference.entity';
import { ScheduleItem } from '../schedule_item/entities/schedule_item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LearningPlan,
      User,
      Course,
      PlanConstraint,
      PlanPreference,
      ScheduleItem,
    ]),
  ],
  providers: [LearningPlanService],
  controllers: [LearningPlanController],
  exports: [LearningPlanService],
})
export class LearningPlanModule {}
