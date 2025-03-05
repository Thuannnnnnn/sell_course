import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { QaStudyService } from './qa_study.service';
import { CreateQaDto } from './dto/create-qa.dto';
import { ResponseQaDto } from './dto/response-qa.dto';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';

@ApiTags('QA Study')
@Controller('api/qa_study')
export class QaStudyController {
  constructor(private readonly qaService: QaStudyService) {}

  @Post()
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a QA entry' })
  @ApiResponse({
    status: 201,
    description: 'QA created successfully',
    type: ResponseQaDto,
  })
  @ApiResponse({ status: 404, description: 'User or Course not found' })
  create(@Body() createQaDto: CreateQaDto) {
    return this.qaService.createQa(createQaDto);
  }

  @Get('/:courseId')
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all QAs for a course' })
  @ApiResponse({
    status: 200,
    description: 'List of QAs',
    type: [ResponseQaDto],
  })
  findAll(@Param('courseId') courseId: string) {
    return this.qaService.findByCourseId(courseId);
  }

  @Delete(':id')
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a QA entry' })
  @ApiResponse({ status: 200, description: 'QA deleted successfully' })
  @ApiResponse({ status: 404, description: 'QA not found' })
  remove(@Param('id') id: string) {
    return this.qaService.remove(id);
  }
}
