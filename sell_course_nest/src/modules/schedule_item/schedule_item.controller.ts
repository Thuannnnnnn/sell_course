import {
  Controller,
  Post,
  Get,
  Param,
  Patch,
  Delete,
  Body,
} from '@nestjs/common';
import { ScheduleItemService } from './schedule_item.service';
import { CreateScheduleItemDto } from './schedule_item.dto';

@Controller('schedule-item')
export class ScheduleItemController {
  constructor(private readonly scheduleService: ScheduleItemService) {}

  @Post()
  create(@Body() dto: CreateScheduleItemDto) {
    return this.scheduleService.create(dto);
  }

  @Get()
  findAll() {
    return this.scheduleService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.scheduleService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateScheduleItemDto>) {
    return this.scheduleService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.scheduleService.delete(id);
  }

  @Delete('/by-plan/:planId')
  deleteByPlan(@Param('planId') planId: string) {
    return this.scheduleService.deleteByPlan(planId);
  }
}
