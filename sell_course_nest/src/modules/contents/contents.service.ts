import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contents } from './entities/contents.entity';
import { Lesson } from '../lesson/entities/lesson.entity';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(Contents)
    private readonly contentRepository: Repository<Contents>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
  ) {}

  async createContent(
    lessonId: string,
    contentName: string,
    contentType: string,
  ): Promise<boolean> {
    try {
      const lesson = await this.lessonRepository.findOne({
        where: { lessonId },
      });

      if (!lesson) {
        throw new HttpException('Lesson not found', HttpStatus.NOT_FOUND);
      }
      const contentCount = await this.contentRepository.count({
        where: { lesson: { lessonId } },
      });

      console.log(contentCount);
      const content = this.contentRepository.create({
        lesson,
        contentName,
        contentType,
        order: contentCount + 1,
      });

      const result = await this.contentRepository.save(content);
      if (!result) {
        throw new HttpException(
          'Failed to save content',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return true;
    } catch (error) {
      console.error('Error creating content:', error);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getContentsByLesson(lessonId: string) {
    return await this.contentRepository.find({
      where: { lesson: { lessonId } },
      relations: ['lesson'],
    });
  }

  async deleteContent(contentId: string) {
    const result = await this.contentRepository.delete(contentId);
    if (result.affected === 0) {
      throw new HttpException('Content not found', HttpStatus.NOT_FOUND);
    }
    return { message: 'Content deleted successfully' };
  }
}
