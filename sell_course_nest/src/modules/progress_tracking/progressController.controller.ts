import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ProgressTrackingService } from './progressService.service';
import { MarkProgressDto } from './dto/progressRequestDto.dto';
import { LessonProgressResponseDto } from './dto/progressReponseDto.dto';
import { ProgressTracking } from './entities/progress.entity';

@Controller('progress')
export class ProgressTrackingController {
  constructor(private readonly progressService: ProgressTrackingService) {}

  @Post('complete')
  async markAsCompleted(
    @Body() markProgressDto: MarkProgressDto,
  ): Promise<ProgressTracking> {
    const { userId, contentId, lessonId } = markProgressDto;
    const progress = await this.progressService.markAsCompleted(
      userId,
      contentId,
      lessonId,
    );
    return progress;
  }

  @Get('lesson/:lessonId/user/:userId')
  async getLessonProgress(
    @Param('lessonId') lessonId: string,
    @Param('userId') userId: string,
  ): Promise<LessonProgressResponseDto> {
    const isCompleted = await this.progressService.getLessonCompletionStatus(
      userId,
      lessonId,
    );
    return { lessonId, userId, isCompleted };
  }

  @Get('lesson/:lessonId/user/:userId/completed-contents-count')
  async getCompletedContentsCount(
    @Param('lessonId') lessonId: string,
    @Param('userId') userId: string,
  ): Promise<{
    lessonId: string;
    userId: string;
    completedContentsCount: number;
  }> {
    const count = await this.progressService.getCompletedContentsCount(
      userId,
      lessonId,
    );
    return { lessonId, userId, completedContentsCount: count };
  }

  @Get('course/:courseId/user/:userId/progress')
  async getCourseProgress(
    @Param('courseId') courseId: string,
    @Param('userId') userId: string,
  ): Promise<{ progress: number }> {
    const progress = await this.progressService.calculateCourseProgress(
      userId,
      courseId,
    );
    return { progress };
  }

  @Get('content/:contentId/user/:userId/status')
  async getContentStatus(
    @Param('contentId') contentId: string,
    @Param('userId') userId: string,
  ): Promise<{ contentId: string; userId: string; isCompleted: boolean }> {
    const isCompleted = await this.progressService.getContentCompletionStatus(
      userId,
      contentId,
    );
    return { contentId, userId, isCompleted };
  }

  @Get('course/:courseId/user/:userId/completed-lessons-count')
  async getCompletedLessonsCountInCourse(
    @Param('courseId') courseId: string,
    @Param('userId') userId: string,
  ): Promise<{
    courseId: string;
    userId: string;
    completedLessonsCount: number;
  }> {
    const count = await this.progressService.getCompletedLessonsCountInCourse(
      userId,
      courseId,
    );
    return { courseId, userId, completedLessonsCount: count };
  }
}
