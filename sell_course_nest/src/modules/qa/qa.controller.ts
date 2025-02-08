import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { QaService } from './qa.service';
import { CreateQaDto } from './dto/create-qa.dto';

@Controller('api/qa')
export class QaController {
  constructor(private readonly qaService: QaService) {}

  @Post()
  create(@Body() createQaDto: CreateQaDto) {
    return this.qaService.createQa(createQaDto);
  }

  @Get('/:courseId')
  findAll(@Param('courseId') courseId: string) {
    return this.qaService.findByCourseId(courseId);
  }

  //   @Get(':id')
  //   findOne(@Param('id') id: string) {
  //     return this.qaService.findOne(id);
  //   }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.qaService.remove(id);
  }
}
