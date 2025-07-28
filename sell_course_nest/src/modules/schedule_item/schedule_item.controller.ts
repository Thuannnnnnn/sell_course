import {
  Controller,
  Post,
  Get,
  Param,
  Patch,
  Delete,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ScheduleItemService } from './schedule_item.service';
import { CreateScheduleItemDto } from './schedule_item.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../Auth/roles.guard';

@Controller('schedule-item')
export class ScheduleItemController {
  constructor(private readonly scheduleService: ScheduleItemService) {}
  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post()
  create(@Body() dto: CreateScheduleItemDto) {
    return this.scheduleService.create(dto);
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get()
  findAll() {
    return this.scheduleService.findAll();
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.scheduleService.findById(id);
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateScheduleItemDto>) {
    return this.scheduleService.update(id, dto);
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.scheduleService.delete(id);
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete('/by-plan/:planId')
  deleteByPlan(@Param('planId') planId: string) {
    return this.scheduleService.deleteByPlan(planId);
  }
}
