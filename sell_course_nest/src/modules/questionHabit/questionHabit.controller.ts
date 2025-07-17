import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  Put,
} from '@nestjs/common';
import { QuestionHabitDto } from './dto/questionHabitDto.dto';
import { QuestionHabitService } from './questionHabit.service';

@Controller('api/question-habits')
export class QuestionHabitController {
  constructor(private readonly questionHabitService: QuestionHabitService) {}

  @Post()
  async create(@Body() dto: QuestionHabitDto) {
    return this.questionHabitService.create(dto);
  }

  @Get()
  async findAll() {
    return this.questionHabitService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.questionHabitService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: QuestionHabitDto) {
    return this.questionHabitService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.questionHabitService.remove(id);
  }
}
