import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { LearningPlanService } from './learning-plan.service';
import { CreateLearningPlanDto } from './create-learning-plan.dto';

@Controller('learningPath')
export class LearningPlanController {
  constructor(private readonly planService: LearningPlanService) {}

  @Post()
  create(@Body() createDto: CreateLearningPlanDto) {
    return this.planService.create(createDto);
  }

  @Get('/getAll')
  findAll() {
    return this.planService.findAll();
  }

  @Get('/getById/:id')
  findOne(@Param('id') id: string) {
    return this.planService.findOne(id);
  }
}
