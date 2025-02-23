import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProgressTracking } from './entities/progress.entity';
import { Contents } from '../contents/entities/contents.entity';
import { Lesson } from '../lesson/entities/lesson.entity';

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
}
