import { Controller, Post, Body, HttpException } from '@nestjs/common';
import { LessonService } from './lesson.service';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
@ApiBearerAuth()
@Controller('api/lesson')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  // @UseGuards(JwtAuthGuard)
  @Post('create_lesson')
  @ApiOperation({ summary: 'Create a new lesson' })
  @ApiResponse({ status: 201, description: 'Lesson created successfully' })
  async createLesson(@Body() body: { lessonName: string; courseId: string }) {
    try {
      console.log(body.lessonName, body.courseId);
      const result = await this.lessonService.createLesson(
        body.lessonName,
        body.courseId,
      );

      if (result) {
        console.log('OK');
        return { message: 'Lesson created successfully' };
      }
      throw new HttpException('Server error', 500);
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }

  /*
   * @Get()
   * @ApiOperation({ summary: 'Get all lessons' })
   * @ApiResponse({ status: 200, description: 'List of lessons' })
   * async getLessons() {
   *   return this.lessonService.getLessons();
   * }
   * @Get(':lessonId')
   * @ApiOperation({ summary: 'Get lesson by ID' })
   * @ApiResponse({ status: 200, description: 'Lesson details' })
   * async getLessonById(@Param('lessonId') lessonId: string) {
   *   return this.lessonService.getLessonById(lessonId);
   * }
   */

  /*
   * @UseGuards(JwtAuthGuard)
   * @Put(':lessonId')
   * @ApiOperation({ summary: 'Update lesson details' })
   * @ApiResponse({ status: 200, description: 'Lesson updated successfully' })
   * async updateLesson(
   *   @Param('lessonId') lessonId: string,
   *   @Body() updateLessonDto: UpdateLessonDTO,
   * ) {
   *   return this.lessonService.updateLesson(lessonId, updateLessonDto);
   * }
   */

  /*
   * @UseGuards(JwtAuthGuard)
   * @Delete(':lessonId')
   * @ApiOperation({ summary: 'Delete a lesson' })
   * @ApiResponse({ status: 200, description: 'Lesson deleted successfully' })
   * async deleteLesson(@Param('lessonId') lessonId: string) {
   *   return this.lessonService.deleteLesson(lessonId);
   * }
   */
}
