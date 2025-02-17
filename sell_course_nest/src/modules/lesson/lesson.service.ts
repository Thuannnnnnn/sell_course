import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from './entities/lesson.entity';
import { Course } from '../course/entities/course.entity';
import { UpdateLessonDTO } from './dto/lesson.dto';
import { plainToInstance } from 'class-transformer';
import { CourseWithLessonsDto } from './dto/lesson.dto';
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

      const lessonCount = await this.lessonRepository.count({
        where: { course },
      });

      const lesson = this.lessonRepository.create({
        lessonName,
        course,
        order: lessonCount + 1,
      });

      await this.lessonRepository.save(lesson);
      return true;
    } catch (error) {
      console.error('Error creating lesson:', error);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Lấy danh sách bài học kèm nội dung
  async getLessons(): Promise<Lesson[]> {
    return await this.lessonRepository.find({
      relations: ['course', 'contents'], // Lấy luôn danh sách content
      order: { order: 'ASC' },
    });
  }

  // Lấy chi tiết bài học theo ID kèm nội dung
  async getLessonById(lessonId: string): Promise<Lesson> {
    const lesson = await this.lessonRepository.findOne({
      where: { lessonId },
      relations: ['course', 'contents'], // Lấy luôn danh sách content
    });

    if (!lesson) {
      throw new HttpException('Lesson not found', HttpStatus.NOT_FOUND);
    }
    return lesson;
  }

  async updateLesson(
    lessonId: string,
    updateLessonDto: UpdateLessonDTO,
  ): Promise<Lesson> {
    const lesson = await this.lessonRepository.findOne({ where: { lessonId } });

    if (!lesson) {
      throw new HttpException('Lesson not found', HttpStatus.NOT_FOUND);
    }

    await this.lessonRepository.update(lessonId, updateLessonDto);
    return this.lessonRepository.findOne({
      where: { lessonId },
      relations: ['contents'],
    });
  }

  async deleteLesson(lessonId: string): Promise<void> {
    const lesson = await this.lessonRepository.findOne({ where: { lessonId } });

    if (!lesson) {
      throw new HttpException('Lesson not found', HttpStatus.NOT_FOUND);
    }

    await this.lessonRepository.delete(lessonId);
  }
  async getLessonsByCourseId(courseId: string): Promise<CourseWithLessonsDto> {
    const lessons = await this.lessonRepository.find({
      where: { course: { courseId } },
      relations: ['course', 'contents'],
      order: { order: 'ASC' },
    });

    if (!lessons.length) {
      throw new NotFoundException(
        'Không tìm thấy bài học nào cho khóa học này',
      );
    }

    const response = {
      courseId: lessons[0].course.courseId,
      courseName: lessons[0].course.title,
      lessons: lessons.map((lesson) => ({
        lessonId: lesson.lessonId,
        lessonName: lesson.lessonName,
        order: lesson.order,
        contents: lesson.contents.map((content) => ({
          contentId: content.contentId,
          contentName: content.contentName,
          contentType: content.contentType,
          order: content.order,
        })),
      })),
    };

    return plainToInstance(CourseWithLessonsDto, response, {
      excludeExtraneousValues: true,
    });
  }
}
