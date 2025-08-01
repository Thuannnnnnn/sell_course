import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { LessonService } from './lesson.service';
import { UpdateLessonDTO } from './dto/lesson.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserRole } from '../Auth/user.enum';
import { Roles } from '../Auth/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../Auth/roles.guard';

@ApiTags('Lessons')
@Controller('api')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @ApiBearerAuth('Authorization')
  @Roles(UserRole.INSTRUCTOR)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('instructor/lesson/create_lesson')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new lesson',
    description: 'Creates a new lesson with name and course ID',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        lessonName: { type: 'string', example: 'Introduction to TypeScript' },
        courseId: { type: 'string', example: 'course123' },
      },
      required: ['lessonName', 'courseId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Lesson created successfully',
    schema: { example: { message: 'Lesson created successfully' } },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createLesson(@Body() body: { lessonName: string; courseId: string }) {
    const result = await this.lessonService.createLesson(
      body.lessonName,
      body.courseId,
    );
    return { message: 'Lesson created successfully', data: result };
  }
  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all lessons',
    description: 'Retrieves all lessons with their contents',
  })
  @ApiResponse({
    status: 200,
    description: 'List of lessons retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          lessonId: { type: 'string', example: 'lesson123' },
          lessonName: { type: 'string', example: 'Introduction to TypeScript' },
          courseId: { type: 'string', example: 'course123' },
        },
      },
    },
  })
  async getLessons() {
    return this.lessonService.getLessons();
  }
  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('instructor/lesson/view_lesson')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all lessons for instructor',
    description: 'Retrieves all lessons with their contents for instructor',
  })
  @ApiResponse({
    status: 200,
    description: 'List of lessons retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          lessonId: { type: 'string', example: 'lesson123' },
          lessonName: { type: 'string', example: 'Introduction to TypeScript' },
          courseId: { type: 'string', example: 'course123' },
        },
      },
    },
  })
  async getLessonsForInstructor() {
    return this.lessonService.getLessons();
  }
  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('instructor/lesson/view_lesson/:courseId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get lessons by course ID (Admin)',
    description: 'Retrieves lessons for a specific course - Admin view',
  })
  @ApiParam({
    name: 'courseId',
    required: true,
    description: 'ID of the course',
    example: 'course123',
  })
  @ApiResponse({ status: 200, description: 'Lessons retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async getLessonByCourseIdAdmin(@Param('courseId') courseId: string) {
    return this.lessonService.getLessonsByCourseId(courseId);
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('lesson/view_lesson/:courseId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get lessons by course ID (Public)',
    description: 'Retrieves lessons for a specific course - Public view',
  })
  @ApiParam({
    name: 'courseId',
    required: true,
    description: 'ID of the course',
    example: 'course123',
  })
  @ApiResponse({ status: 200, description: 'Lessons retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async getLessonByCourseId(@Param('courseId') courseId: string) {
    return this.lessonService.getLessonsByCourseId(courseId);
  }

  @ApiBearerAuth('Authorization')
  @Roles(UserRole.INSTRUCTOR)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Put('instructor/lesson/update_lesson/:lessonId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update lesson details',
    description: 'Updates an existing lesson',
  })
  @ApiParam({
    name: 'lessonId',
    required: true,
    description: 'ID of the lesson to update',
    example: 'lesson123',
  })
  @ApiBody({ type: UpdateLessonDTO })
  @ApiResponse({
    status: 200,
    description: 'Lesson updated successfully',
    schema: { example: { message: 'Lesson updated successfully' } },
  })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async updateLesson(
    @Param('lessonId') lessonId: string,
    @Body() updateLessonDto: UpdateLessonDTO,
  ) {
    return this.lessonService.updateLesson(lessonId, updateLessonDto);
  }

  @ApiBearerAuth('Authorization')
  @Roles(UserRole.INSTRUCTOR)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Put('instructor/lesson/update_order')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update lesson order',
    description: 'Updates the order of multiple lessons',
  })
  @ApiBody({
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          lessonId: { type: 'string', example: 'lesson123' },
          order: { type: 'number', example: 1 },
        },
        required: ['lessonId', 'order'],
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Lesson order updated successfully',
    schema: { example: { message: 'Lesson order updated successfully' } },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async updateLessonOrder(
    @Body() body: { lessons: { lessonId: string; order: number }[] },
  ): Promise<{ message: string }> {
    return this.lessonService.updateLessonOrder(body.lessons);
  }

  @ApiBearerAuth('Authorization')
  @Roles(UserRole.INSTRUCTOR)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete('instructor/lesson/delete_lesson/:lessonId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a lesson',
    description: 'Deletes an existing lesson',
  })
  @ApiParam({
    name: 'lessonId',
    required: true,
    description: 'ID of the lesson to delete',
    example: 'lesson123',
  })
  @ApiResponse({
    status: 200,
    description: 'Lesson deleted successfully',
    schema: { example: { message: 'Lesson deleted successfully' } },
  })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async deleteLesson(@Param('lessonId') lessonId: string) {
    return this.lessonService.deleteLesson(lessonId);
  }
}
