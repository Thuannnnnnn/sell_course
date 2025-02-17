import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from './entities/lesson.entity';
import { Course } from '../course/entities/course.entity';

@Injectable()
export class LessonService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async createLesson(lessonName: string, courseId: string): Promise<boolean> {
    try {
      const course = await this.courseRepository.findOne({
        where: { courseId },
      });

      if (!course) {
        throw new HttpException('Course not found', HttpStatus.NOT_FOUND);
      }

      // Lấy số lượng bài học hiện có để xác định thứ tự mới
      const lessonCount = await this.lessonRepository.count({
        where: { course },
      });

      const lesson = this.lessonRepository.create({
        lessonName,
        course,
        order: lessonCount + 1,
      });

      const result = await this.lessonRepository.save(lesson);
      if (!result) {
        throw new HttpException(
          'Failed to save lesson',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return true;
    } catch (error) {
      console.error('Error creating lesson:', error);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
