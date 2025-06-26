import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Contents } from './entities/contents.entity';
import { Lesson } from '../lesson/entities/lesson.entity';
import { Quizz } from '../quizz/entities/quizz.entity';
import { Questionentity } from '../quizz/entities/question.entity';
import { AnswerEntity } from '../quizz/entities/answer.entity';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(Contents)
    private readonly contentRepository: Repository<Contents>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(Quizz)
    private readonly quizzRepository: Repository<Quizz>,
    @InjectRepository(Questionentity)
    private readonly questionRepository: Repository<Questionentity>,
    @InjectRepository(AnswerEntity)
    private readonly answerRepository: Repository<AnswerEntity>,
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
      order: { order: 'ASC' },
    });
  }

  async deleteContent(contentId: string) {
    // First, check if content exists
    const content = await this.contentRepository.findOne({
      where: { contentId },
    });

    if (!content) {
      throw new HttpException('Content not found', HttpStatus.NOT_FOUND);
    }

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

    const result = await this.contentRepository.delete(contentId);
    
    if (result.affected === 0) {
      throw new HttpException('Content not found', HttpStatus.NOT_FOUND);
    }

    return { 
      message: 'Content deleted successfully',
      deletedQuizzes: quizzes.length,
      deletedQuestions: quizzes.reduce(
        (total, quiz) => total + (quiz.questions?.length || 0),
        0,
      ),
      deletedAnswers: quizzes.reduce(
        (total, quiz) =>
          total +
          (quiz.questions?.reduce(
            (qTotal, question) => qTotal + (question.answers?.length || 0),
            0,
          ) || 0),
        0,
      ),
    };
  }

  async updateContent(
    contentId: string,
    contentName: string,
    contentType: string,
  ): Promise<Contents> {
    const content = await this.contentRepository.findOne({
      where: { contentId },
    });

    if (!content) {
      throw new HttpException('Content not found', HttpStatus.NOT_FOUND);
    }

    content.contentName = contentName;
    content.contentType = contentType;
    return await this.contentRepository.save(content);
  }

  async updateContentOrder(
    contents: { contentId: string; order: number }[],
  ): Promise<{ message: string }> {
    try {
      if (!Array.isArray(contents)) {
        throw new HttpException(
          'Contents must be an array',
          HttpStatus.BAD_REQUEST,
        );
      }
      const contentIds = contents.map((c) => c.contentId);
      const count = await this.contentRepository.count({
        where: { contentId: In(contentIds) },
      });

      if (count !== contents.length) {
        const existing = await this.contentRepository.find({
          where: { contentId: In(contentIds) },
          select: ['contentId'],
        });
        const foundIds = new Set(existing.map((c) => c.contentId));
        const missing = contents.filter((c) => !foundIds.has(c.contentId));
        throw new HttpException(
          `Contents with IDs ${missing.map((c) => c.contentId).join(', ')} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      await this.contentRepository
        .createQueryBuilder()
        .update()
        .set({
          order: () =>
            'CASE ' +
            contents
              .map((c) => `WHEN contentId = '${c.contentId}' THEN ${c.order}`)
              .join(' ') +
            ' END',
        })
        .where({ contentId: In(contentIds) })
        .execute();

      return { message: 'Content order updated successfully' };
    } catch (error) {
      console.error('Error updating content order:', error);
      throw error instanceof HttpException
        ? error
        : new HttpException(
            'Internal Server Error',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
    }
  }
}
