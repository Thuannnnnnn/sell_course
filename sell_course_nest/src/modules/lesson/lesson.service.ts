import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Lesson } from './entities/lesson.entity';
import { Course } from '../course/entities/course.entity';
import { Contents } from '../contents/entities/contents.entity';
import { Quizz } from '../quizz/entities/quizz.entity';
import { Questionentity } from '../quizz/entities/question.entity';
import { AnswerEntity } from '../quizz/entities/answer.entity';
import { UpdateLessonDTO, CourseWithLessonsDto } from './dto/lesson.dto';
import { plainToInstance } from 'class-transformer';
@Injectable()
export class LessonService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Contents)
    private readonly contentRepository: Repository<Contents>,
    @InjectRepository(Quizz)
    private readonly quizzRepository: Repository<Quizz>,
    @InjectRepository(Questionentity)
    private readonly questionRepository: Repository<Questionentity>,
    @InjectRepository(AnswerEntity)
    private readonly answerRepository: Repository<AnswerEntity>,
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
  async getLessons(): Promise<Lesson[]> {
    const lessons = await this.lessonRepository.find({
      relations: ['course', 'contents'],
      order: { order: 'ASC' }, // Order lessons by their 'order' field
    });

    // Ensure contents are ordered by their 'order' field
    lessons.forEach((lesson) => {
      lesson.contents = lesson.contents.sort((a, b) => a.order - b.order);
    });

    return lessons;
  }
  async getLessonById(lessonId: string): Promise<Lesson> {
    const lesson = await this.lessonRepository.findOne({
      where: { lessonId },
      relations: ['course', 'contents'],
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

  async deleteLesson(lessonId: string): Promise<{ message: string }> {
    const lesson = await this.lessonRepository.findOne({ where: { lessonId } });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    // Get all contents for this lesson
    const contents = await this.contentRepository.find({
      where: { lesson: { lessonId } },
    });

    // Delete each content and its related data
    for (const content of contents) {
      await this.deleteContentAndRelatedData(content.contentId);
    }

    // Finally delete the lesson
    await this.lessonRepository.delete(lessonId);
    return { message: 'Lesson deleted successfully' };
  }

  private async deleteContentAndRelatedData(contentId: string): Promise<void> {
    // Get all quizzes for this content
    const quizzes = await this.quizzRepository.find({
      where: { contentId },
      relations: ['questions', 'questions.answers'],
    });

    // Delete in correct order: answers -> questions -> quizzes -> content
    for (const quiz of quizzes) {
      // Delete all answers for this quiz's questions
      for (const question of quiz.questions || []) {
        if (question.answers && question.answers.length > 0) {
          await this.answerRepository.remove(question.answers);
        }
      }
      // Delete all questions for this quiz
      if (quiz.questions && quiz.questions.length > 0) {
        await this.questionRepository.remove(quiz.questions);
      }
    }

    // Delete all quizzes
    if (quizzes.length > 0) {
      await this.quizzRepository.remove(quizzes);
    }

    // Finally delete the content
    await this.contentRepository.delete(contentId);
  }

  async getLessonsByCourseId(courseId: string): Promise<CourseWithLessonsDto> {
    const lessons = await this.lessonRepository.find({
      where: { course: { courseId } },
      relations: ['course', 'contents'],
      order: { order: 'ASC' }, // Order lessons by their 'order' field
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
        contents: lesson.contents
          .sort((a, b) => a.order - b.order) // Ensure contents are ordered by 'order' field
          .map((content) => ({
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
  async updateLessonOrder(
    lessons: { lessonId: string; order: number }[],
  ): Promise<{ message: string }> {
    if (!Array.isArray(lessons)) {
      throw new Error('Lessons must be an array');
    }
    const lessonIds = lessons.map((l) => l.lessonId);
    const count = await this.lessonRepository.count({
      where: { lessonId: In(lessonIds) },
    });

    if (count !== lessons.length) {
      const existing = await this.lessonRepository.find({
        where: { lessonId: In(lessonIds) },
        select: ['lessonId'],
      });
      const foundIds = new Set(existing.map((l) => l.lessonId));
      const missing = lessons.filter((l) => !foundIds.has(l.lessonId));
      throw new NotFoundException(
        `Lessons with IDs ${missing.map((l) => l.lessonId).join(', ')} not found`,
      );
    }
    await this.lessonRepository
      .createQueryBuilder()
      .update()
      .set({
        order: () =>
          'CASE ' +
          lessons
            .map((l) => `WHEN lessonId = '${l.lessonId}' THEN ${l.order}`)
            .join(' ') +
          ' END',
      })
      .where({ lessonId: In(lessonIds) })
      .execute();

    return { message: 'Lesson order updated successfully' };
  }
}
