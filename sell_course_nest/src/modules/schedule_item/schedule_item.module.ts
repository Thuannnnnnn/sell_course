import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ScheduleItem } from './entities/schedule_item.entity';
import { LearningPlan } from '../learning-plan/learning-plan.entity';
import { Course } from '../course/entities/course.entity';
import { ScheduleItemController } from './schedule_item.controller';
import { ScheduleItemService } from './schedule_item.service';

@Module({
  imports: [TypeOrmModule.forFeature([ScheduleItem, LearningPlan, Course])],
  controllers: [ScheduleItemController],
  providers: [ScheduleItemService],
})
export class ScheduleItemModule {}
