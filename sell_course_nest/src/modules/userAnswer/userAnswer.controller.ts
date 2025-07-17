import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { UserAnswerService } from './userAnswer.service';
import { UserAnswerDto } from './dto/userAnswerDto.dto';

@Controller('user-answers')
export class UserAnswerController {
  constructor(private readonly userAnswerService: UserAnswerService) {}

  @Post()
  async create(@Body() dto: UserAnswerDto) {
    return this.userAnswerService.create(dto);
  }

  @Get()
  async findAll() {
    return this.userAnswerService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userAnswerService.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.userAnswerService.remove(id);
  }
}
