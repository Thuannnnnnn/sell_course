import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Put,
} from '@nestjs/common';
import { ProgressTrackingService } from './progressService.service';
import {
  BulkProgressRequest,
  ContentProgress,
  LearningPathProgress,
  MarkProgressDto,
  UpdateContentStatusRequest,
} from './dto/progressRequestDto.dto';
import { LessonProgressResponseDto } from './dto/progressReponseDto.dto';
import { ProgressTracking } from './entities/progress.entity';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../Auth/roles.guard';

@Controller('progress')
export class ProgressTrackingController {
  constructor(private readonly progressService: ProgressTrackingService) {}

  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
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

  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
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

  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
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

  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
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

  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
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

  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
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

  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('bulk-status/user/:userId')
  async getBulkContentProgress(
    @Param('userId') userId: string,
    @Body() request: BulkProgressRequest,
  ): Promise<Record<string, ContentProgress>> {
    const { contentIds } = request;
    return await this.progressService.getBulkContentProgress(
      userId,
      contentIds,
    );
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('learning-path-progress/user/:userId')
  async getLearningPathProgress(
    @Param('userId') userId: string,
    @Body() request: BulkProgressRequest,
  ): Promise<LearningPathProgress> {
    const { contentIds } = request;
    return await this.progressService.getLearningPathProgress(
      userId,
      contentIds,
    );
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Put('content/:contentId/user/:userId')
  async updateContentStatus(
    @Param('contentId') contentId: string,
    @Param('userId') userId: string,
    @Body() request: UpdateContentStatusRequest,
  ): Promise<ContentProgress> {
    const { status, progressPercentage, timeSpentMinutes } = request;
    return await this.progressService.updateContentStatus(
      contentId,
      userId,
      status,
      progressPercentage,
      timeSpentMinutes,
    );
  }
}
