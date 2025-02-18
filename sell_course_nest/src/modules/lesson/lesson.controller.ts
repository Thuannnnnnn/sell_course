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
@Controller('api')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Post('admin/lesson/create_lesson')
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

  @Get('admin/lesson/view_lesson/:courseId')
  @ApiOperation({ summary: 'Get course by ID with contents' })
  @ApiResponse({ status: 200, description: 'Lesson details' })
  async getLessonByCourseIdAdmin(@Param('courseId') courseId: string) {
    return this.lessonService.getLessonsByCourseId(courseId);
  }
  @Get('/view_lesson/:courseId')
  @ApiOperation({ summary: 'Get course by ID with contents' })
  @ApiResponse({ status: 200, description: 'Lesson details' })
  async getLessonByCourseId(@Param('courseId') courseId: string) {
    return this.lessonService.getLessonsByCourseId(courseId);
  }

  @Put('admin/update_lesson/:lessonId')
  @ApiOperation({ summary: 'Update lesson details' })
  @ApiResponse({ status: 200, description: 'Lesson updated successfully' })
  async updateLesson(
    @Param('lessonId') lessonId: string,
    @Body() updateLessonDto: UpdateLessonDTO,
  ) {
    return this.lessonService.updateLesson(lessonId, updateLessonDto);
  }

  @Delete('admin/delete_lesson/:lessonId')
  @ApiOperation({ summary: 'Delete a lesson' })
  @ApiResponse({ status: 200, description: 'Lesson deleted successfully' })
  async deleteLesson(@Param('lessonId') lessonId: string) {
    return this.lessonService.deleteLesson(lessonId);
  }
}
