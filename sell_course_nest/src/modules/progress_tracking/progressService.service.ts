import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ProgressTracking } from './entities/progress.entity';
import { Contents } from '../contents/entities/contents.entity';
import { Lesson } from '../lesson/entities/lesson.entity';
import {
  ContentProgress,
  LearningPathProgress,
} from './dto/progressRequestDto.dto';

@Injectable()
export class ProgressTrackingService {
  constructor(
    @InjectRepository(ProgressTracking)
    private progressRepository: Repository<ProgressTracking>,
    @InjectRepository(Contents)
    private contentsRepository: Repository<Contents>,
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
  ) {}

  async markAsCompleted(
    userId: string,
    contentId: string,
    lessonId: string,
  ): Promise<ProgressTracking> {
    let progress = await this.progressRepository.findOne({
      where: {
        user: { user_id: userId },
        content: { contentId: contentId },
        lesson: { lessonId: lessonId },
      },
    });
    if (!progress) {
      progress = this.progressRepository.create({
        user: { user_id: userId },
        content: { contentId: contentId },
        lesson: { lessonId: lessonId },
        is_completed: true,
        completed_at: new Date(),
      });
    } else {
      progress.is_completed = true;
      progress.completed_at = new Date();
    }
    return await this.progressRepository.save(progress);
  }

  async getLessonCompletionStatus(
    userId: string,
    lessonId: string,
  ): Promise<boolean> {
    const totalContents = await this.contentsRepository.count({
      where: { lesson: { lessonId } },
    });
    const completedCount = await this.progressRepository.count({
      where: {
        user: { user_id: userId },
        lesson: { lessonId },
        is_completed: true,
      },
    });
    return completedCount === totalContents;
  }

  async getContentCompletionStatus(
    userId: string,
    contentId: string,
  ): Promise<boolean> {
    const progress = await this.progressRepository.findOne({
      where: {
        user: { user_id: userId },
        content: { contentId: contentId },
        is_completed: true,
      },
    });

    return !!progress;
  }

  async getCompletedContentsCount(
    userId: string,
    lessonId: string,
  ): Promise<number> {
    return await this.progressRepository.count({
      where: {
        user: { user_id: userId },
        lesson: { lessonId },
        is_completed: true,
      },
    });
  }

  async calculateCourseProgress(
    userId: string,
    courseId: string,
  ): Promise<number> {
    const lessons = await this.lessonRepository.find({
      where: { course: { courseId } },
      relations: ['contents'],
    });

    let totalContents = 0;
    let completedContents = 0;

    for (const lesson of lessons) {
      const lessonContents = lesson.contents.length;
      totalContents += lessonContents;

      if (lessonContents > 0) {
        const completedCount = await this.progressRepository.count({
          where: {
            user: { user_id: userId },
            lesson: { lessonId: lesson.lessonId },
            is_completed: true,
          },
        });
        completedContents += completedCount;
      }
    }

    if (totalContents === 0) {
      return 0;
    }

    return (completedContents / totalContents) * 100;
  }

  async getCompletedLessonsCountInCourse(
    userId: string,
    courseId: string,
  ): Promise<number> {
    const lessons = await this.lessonRepository.find({
      where: { course: { courseId } },
    });
    let completedLessons = 0;
    for (const lesson of lessons) {
      const totalContents = await this.contentsRepository.count({
        where: { lesson: { lessonId: lesson.lessonId } },
      });
      if (totalContents === 0) {
        continue;
      }
      const completedCount = await this.progressRepository.count({
        where: {
          user: { user_id: userId },
          lesson: { lessonId: lesson.lessonId },
          is_completed: true,
        },
      });
      if (completedCount === totalContents) {
        completedLessons++;
      }
    }
    return completedLessons;
  }

  async getBulkContentProgress(
    userId: string,
    contentIds: string[],
  ): Promise<Record<string, ContentProgress>> {
    // Get all progress records for the user and content IDs
    const progressRecords = await this.progressRepository.find({
      where: {
        user: { user_id: userId },
        content: { contentId: In(contentIds) },
      },
      relations: ['content'],
    });

    // Create a map of contentId to progress
    const progressMap: Record<string, ContentProgress> = {};

    // Initialize all content IDs with default values
    contentIds.forEach((contentId) => {
      progressMap[contentId] = {
        contentId,
        status: 'not_started',
        progressPercentage: 0,
        timeSpentMinutes: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    // Update with actual progress data
    progressRecords.forEach((record) => {
      const contentId = record.content.contentId;
      progressMap[contentId] = {
        contentId,
        status: record.is_completed ? 'completed' : 'in_progress',
        progressPercentage: record.is_completed ? 100 : 50, // Simplified logic
        timeSpentMinutes: 0, // This would need to be tracked separately
        createdAt:
          record.completed_at?.toISOString() || new Date().toISOString(),
        updatedAt:
          record.completed_at?.toISOString() || new Date().toISOString(),
        completedAt: record.completed_at?.toISOString(),
      };
    });

    return progressMap;
  }

  /**
   * Get learning path progress summary
   */
  async getLearningPathProgress(
    userId: string,
    contentIds: string[],
  ): Promise<LearningPathProgress> {
    const progressMap = await this.getBulkContentProgress(userId, contentIds);

    let completedContents = 0;
    let inProgressContents = 0;
    let notStartedContents = 0;
    let totalTimeSpent = 0;

    Object.values(progressMap).forEach((progress) => {
      switch (progress.status) {
        case 'completed':
          completedContents++;
          break;
        case 'in_progress':
          inProgressContents++;
          break;
        case 'not_started':
          notStartedContents++;
          break;
      }
      totalTimeSpent += progress.timeSpentMinutes;
    });

    const totalContents = contentIds.length;
    const overallProgressPercentage =
      totalContents > 0
        ? Math.round((completedContents / totalContents) * 100)
        : 0;

    return {
      totalContents,
      completedContents,
      inProgressContents,
      notStartedContents,
      overallProgressPercentage,
      totalTimeSpent,
    };
  }

  /**
   * Update content progress status
   */
  async updateContentStatus(
    contentId: string,
    userId: string,
    status: 'not_started' | 'in_progress' | 'completed',
    progressPercentage?: number,
    timeSpentMinutes?: number,
  ): Promise<ContentProgress> {
    let progress = await this.progressRepository.findOne({
      where: {
        user: { user_id: userId },
        content: { contentId: contentId },
      },
      relations: ['content', 'lesson'],
    });

    if (!progress) {
      // For new progress records, we might need to find the lesson
      // This is a simplified approach - in practice, you might want to
      // pass lessonId from the frontend or look it up from content
      progress = this.progressRepository.create({
        user: { user_id: userId },
        content: { contentId: contentId },
        lesson: null, // This should be properly set based on your business logic
        is_completed: status === 'completed',
        completed_at: status === 'completed' ? new Date() : null,
      });
    } else {
      // Update existing progress
      progress.is_completed = status === 'completed';
      progress.completed_at = status === 'completed' ? new Date() : null;
    }

    const savedProgress = await this.progressRepository.save(progress);

    return {
      contentId,
      status,
      progressPercentage:
        progressPercentage || (status === 'completed' ? 100 : 0),
      timeSpentMinutes: timeSpentMinutes || 0,
      createdAt:
        savedProgress.completed_at?.toISOString() || new Date().toISOString(),
      updatedAt:
        savedProgress.completed_at?.toISOString() || new Date().toISOString(),
      completedAt: savedProgress.completed_at?.toISOString(),
    };
  }
}
