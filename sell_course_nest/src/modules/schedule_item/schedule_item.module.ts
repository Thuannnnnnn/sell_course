import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ScheduleItem } from './entities/schedule_item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ScheduleItem])],
})
export class ScheduleItemtModule {}
