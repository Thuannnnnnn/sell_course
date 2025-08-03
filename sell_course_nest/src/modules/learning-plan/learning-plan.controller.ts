import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { LearningPlanService } from './learning-plan.service';
import {
  UpdateLearningPlanDto,
  N8nLearningPathDtOut,
} from './create-learning-plan.dto';
import { DeleteResult } from 'typeorm';
import { RolesGuard } from '../Auth/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('learningPath')
export class LearningPlanController {
  constructor(private readonly planService: LearningPlanService) {}

  // New endpoint to handle n8n processed data
  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('/from-n8n')
  async createFromN8nData(@Body() n8nData: N8nLearningPathDtOut) {
    const plan = await this.planService.createFromN8nData(n8nData);
    return plan;
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('/getAll')
  async findAll() {
    const plans = await this.planService.findAll();
    return plans.map((plan) =>
      this.planService.transformToFrontendFormat(plan),
    );
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('/getById/:id')
  async findOne(@Param('id') id: string) {
    const plan = await this.planService.findOne(id);
    if (!plan) {
      throw new Error('Learning plan not found');
    }
    return this.planService.transformToFrontendFormat(plan);
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('/user/:userId')
  async findByUserId(@Param('userId') userId: string) {
    const plans = await this.planService.findByUserId(userId);
    return plans.map((plan) =>
      this.planService.transformToFrontendFormat(plan),
    );
  }

  // New endpoint to get content IDs for progress tracking
  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('/content-ids/:planId')
  async getContentIds(@Param('planId') planId: string) {
    const plan = await this.planService.findOne(planId);
    if (!plan) {
      throw new Error('Learning plan not found');
    }
    return {
      planId: plan.planId,
      contentIds: this.planService.getAllContentIds(plan),
    };
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Put('/update/:id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateLearningPlanDto,
  ) {
    const plan = await this.planService.update(id, updateDto);
    return this.planService.transformToFrontendFormat(plan);
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete('/delete/:id')
  remove(@Param('id') id: string): Promise<DeleteResult> {
    return this.planService.remove(id);
  }
}

