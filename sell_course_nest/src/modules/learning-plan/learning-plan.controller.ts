import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Put,
  Delete,
} from '@nestjs/common';
import { LearningPlanService } from './learning-plan.service';
import {
  CreateLearningPlanDto,
  UpdateLearningPlanDto,
} from './create-learning-plan.dto';
import { DeleteResult } from 'typeorm';

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
  @Put('/update/:id')
  update(@Param('id') id: string, @Body() updateDto: UpdateLearningPlanDto) {
    return this.planService.update(id, updateDto);
  }

  @Delete('/delete/:id')
  remove(@Param('id') id: string): Promise<DeleteResult> {
    return this.planService.remove(id);
  }
}
