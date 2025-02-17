import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpException,
} from '@nestjs/common';
import { LessonService } from './lesson.service';
import { UpdateLessonDTO } from './dto/lesson.dto';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('api/lesson')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Post('create_lesson')
  @ApiOperation({ summary: 'Create a new lesson' })
  @ApiResponse({ status: 201, description: 'Lesson created successfully' })
  async createLesson(@Body() body: { lessonName: string; courseId: string }) {
    try {
      const result = await this.lessonService.createLesson(
        body.lessonName,
        body.courseId,
      );

      if (result) {
        return { message: 'Lesson created successfully' };
      }
      throw new HttpException('Server error', 500);
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all lessons with contents' })
  @ApiResponse({ status: 200, description: 'List of lessons' })
  async getLessons() {
    return this.lessonService.getLessons();
  }

  @Get(':lessonId')
  @ApiOperation({ summary: 'Get lesson by ID with contents' })
  @ApiResponse({ status: 200, description: 'Lesson details' })
  async getLessonById(@Param('lessonId') lessonId: string) {
    return this.lessonService.getLessonById(lessonId);
  }

  @Put(':lessonId')
  @ApiOperation({ summary: 'Update lesson details' })
  @ApiResponse({ status: 200, description: 'Lesson updated successfully' })
  async updateLesson(
    @Param('lessonId') lessonId: string,
    @Body() updateLessonDto: UpdateLessonDTO,
  ) {
    return this.lessonService.updateLesson(lessonId, updateLessonDto);
  }

  @Delete(':lessonId')
  @ApiOperation({ summary: 'Delete a lesson' })
  @ApiResponse({ status: 200, description: 'Lesson deleted successfully' })
  async deleteLesson(@Param('lessonId') lessonId: string) {
    return this.lessonService.deleteLesson(lessonId);
  }
}
