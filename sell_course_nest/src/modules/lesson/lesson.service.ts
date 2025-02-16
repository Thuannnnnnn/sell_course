import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from './entities/lesson.entity';
import { Course } from '../course/entities/course.entity';
import { CreateLessonDTO, UpdateLessonDTO } from './dto/lessonResponseData.dto';

@Injectable()
export class LessonService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async createLesson(createLessonDto: CreateLessonDTO): Promise<Lesson> {
    try {
      const course = await this.courseRepository.findOne({
        where: { courseId: createLessonDto.courseId },
      });
      if (!course) {
        throw new HttpException('Course not found', HttpStatus.NOT_FOUND);
      }
      const lesson = this.lessonRepository.create(createLessonDto);
      return await this.lessonRepository.save(lesson);
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        'An unknown error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getLessons(): Promise<Lesson[]> {
    try {
      return await this.lessonRepository.find({ relations: ['course'] });
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        'An unknown error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getLessonById(lessonId: string): Promise<Lesson> {
    try {
      const lesson = await this.lessonRepository.findOne({
        where: { lessonId },
        relations: ['course'],
      });
      if (!lesson) {
        throw new HttpException('Lesson not found', HttpStatus.NOT_FOUND);
      }
      return lesson;
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        'An unknown error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateLesson(
    lessonId: string,
    updateLessonDto: UpdateLessonDTO,
  ): Promise<Lesson> {
    try {
      const lesson = await this.getLessonById(lessonId);
      Object.assign(lesson, updateLessonDto);
      return await this.lessonRepository.save(lesson);
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        'An unknown error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteLesson(lessonId: string): Promise<void> {
    try {
      const lesson = await this.getLessonById(lessonId);
      await this.lessonRepository.remove(lesson);
    } catch (error) {
      if (error instanceof Error) {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException(
        'An unknown error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
