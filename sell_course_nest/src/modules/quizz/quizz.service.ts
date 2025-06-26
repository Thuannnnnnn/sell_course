import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Quizz } from './entities/quizz.entity';
import { Questionentity } from './entities/question.entity';
import { AnswerEntity } from './entities/answer.entity';
import { CreateQuizzDto } from './dto/createQuizz.dto';
import { UpdateQuizzDto } from './dto/updateQuizz.dto';
import { Contents } from '../contents/entities/contents.entity';
import { Lesson } from '../lesson/entities/lesson.entity';
import { Course } from '../course/entities/course.entity';
import { QuizUtils } from './utils/quiz.utils';

@Injectable()
export class QuizzService {

  constructor(
    @InjectRepository(Quizz)
    private readonly quizzRepository: Repository<Quizz>,
    @InjectRepository(Questionentity)
    private readonly questionRepository: Repository<Questionentity>,
    @InjectRepository(AnswerEntity)
    private readonly answerRepository: Repository<AnswerEntity>,
    @InjectRepository(Contents)
    private readonly contentsRepository: Repository<Contents>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  /**
   * Kiểm tra mối quan hệ phân cấp course -> lesson -> content
   */
  private async validateHierarchy(
    contentId: string,
    courseId: string,
    lessonId: string,
  ) {
    const content = await this.contentsRepository.findOne({
      where: { 
        contentId,
        lesson: { 
          lessonId,
          course: { courseId }
        }
      },
      relations: ['lesson', 'lesson.course'],
    });

    if (!content) {
      throw new NotFoundException(
        `Content with ID ${contentId} not found or does not belong to lesson ${lessonId} in course ${courseId}`,
      );
    }

    return content;
  }

  async createQuizz(
    createQuizzDto: CreateQuizzDto,
    courseId: string,
    lessonId: string,
  ) {


    // Kiểm tra mối quan hệ phân cấp
    const content = await this.validateHierarchy(
      createQuizzDto.contentId,
      courseId,
      lessonId
    );

    let quiz = await this.quizzRepository.findOne({
      where: { contentId: createQuizzDto.contentId },
      relations: ['questions', 'questions.answers'],
    });

    if (!quiz) {

      quiz = new Quizz();
      quiz.quizzId = uuidv4();
      quiz.contentId = createQuizzDto.contentId;
      quiz.lessonId = lessonId;
      quiz.courseId = courseId;
      quiz.contents = content;
      quiz = await this.quizzRepository.save(quiz);
    } else {
    }


    for (let i = 0; i < createQuizzDto.questions.length; i++) {
      const questionDto = createQuizzDto.questions[i];


      if (!questionDto.question || questionDto.question.trim() === '') {
        throw new BadRequestException(
          `Invalid question: "${questionDto.question}"`,
        );
      }

      const question = new Questionentity();
      question.questionId = uuidv4();
      question.question = questionDto.question.trim();
      question.difficulty = questionDto.difficulty || 'medium';
      question.weight = questionDto.weight || 1;
      question.quizz = quiz;
      const savedQuestion = await this.questionRepository.save(question);
      console.log(`✅ Question saved:`, savedQuestion.questionId);

      if (!questionDto.answers || questionDto.answers.length === 0) {
        throw new BadRequestException(
          `No answers provided for question: "${questionDto.question}"`,
        );
      }

      // Kiểm tra có ít nhất một câu trả lời đúng
      const hasCorrectAnswer = questionDto.answers.some((a) => a.isCorrect);
      if (!hasCorrectAnswer) {
        throw new BadRequestException(
          `Question "${questionDto.question}" must have at least one correct answer`,
        );
      }

      console.log(`📝 Processing ${questionDto.answers.length} answers...`);
      for (let j = 0; j < questionDto.answers.length; j++) {
        const answerDto = questionDto.answers[j];
        if (!answerDto.answer || answerDto.answer.trim() === '') {
          throw new BadRequestException('Invalid answer text');
        }

        const answer = new AnswerEntity();
        answer.answerId = uuidv4();
        answer.answer = answerDto.answer.trim();
        answer.isCorrect = answerDto.isCorrect;
        answer.question = savedQuestion;
        const savedAnswer = await this.answerRepository.save(answer);
        console.log(`✅ Answer ${j + 1} saved:`, savedAnswer.answerId, `(correct: ${savedAnswer.isCorrect})`);
      }
    }

    console.log('🎉 All questions and answers processed successfully!');

    return this.getQuizById(
      quiz.quizzId,
      courseId,
      lessonId,
      createQuizzDto.contentId,
    );
  }

  async getQuizById(
    quizzId: string,
    courseId?: string,
    lessonId?: string,
    contentId?: string,
  ) {
    console.log('🔍 Getting quiz by ID:', { quizzId, courseId, lessonId, contentId });

    // Đơn giản hóa query - chỉ tìm theo quizzId và validate sau
    const quiz = await this.quizzRepository.findOne({
      where: { quizzId },
      relations: ['contents', 'questions', 'questions.answers'],
    });

    if (!quiz) {

      throw new NotFoundException(`Quiz with ID ${quizzId} not found`);
    }



    // Validate hierarchy nếu có đầy đủ params
    if (contentId && courseId && lessonId) {
      if (quiz.contentId !== contentId || quiz.lessonId !== lessonId || quiz.courseId !== courseId) {

        throw new NotFoundException(`Quiz with ID ${quizzId} not found in the specified hierarchy`);
      }
    }

    return quiz;
  }

  async getQuizzesByContentId(
    contentId: string,
    courseId?: string,
    lessonId?: string,
  ) {
    const queryOptions: any = {
      where: { contents: { contentId } },
      relations: ['contents', 'questions', 'questions.answers'],
    };

    // Nếu có courseId và lessonId thì thêm điều kiện để kiểm tra mối quan hệ
    if (courseId && lessonId) {
      queryOptions.where = {
        contents: {
          contentId,
          lesson: {
            lessonId,
            course: { courseId }
          }
        }
      };
      queryOptions.relations.push('contents.lesson', 'contents.lesson.course');
    }

    const quizzes = await this.quizzRepository.find(queryOptions);

    return quizzes;
  }

  async updateQuizz(
    quizzId: string,
    updateQuizzDto: UpdateQuizzDto,
    courseId?: string,
    lessonId?: string,
    contentId?: string,
  ) {
    console.log('🔄 Updating quiz:', { 
      quizzId, 
      courseId, 
      lessonId, 
      contentId,
      newQuestionsCount: updateQuizzDto.questions?.length || 0
    });

    if (!quizzId || typeof quizzId !== 'string') {
      throw new BadRequestException('Quiz ID must be a valid string');
    }

    const queryOptions: any = {
      where: { quizzId },
      relations: ['questions', 'questions.answers'],
    };

    // Nếu có contentId, courseId, lessonId thì thêm điều kiện để kiểm tra mối quan hệ
    if (contentId && courseId && lessonId) {
      queryOptions.where = {
        quizzId,
        contentId,
        contents: {
          contentId,
          lesson: {
            lessonId,
            course: { courseId }
          }
        }
      };
      queryOptions.relations.push(
        'contents',
        'contents.lesson',
        'contents.lesson.course',
      );
    }

    const quiz = await this.quizzRepository.findOne(queryOptions);

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${quizzId} not found`);
    }

    console.log('📋 Current quiz state:', {
      quizzId: quiz.quizzId,
      currentQuestionsCount: quiz.questions?.length || 0,
      currentQuestions:
        quiz.questions?.map((q) => ({
          questionId: q.questionId,
          question: q.question?.substring(0, 50) + '...',
        })) || [],
    });

    // 🗑️ STEP 1: Delete all existing questions and their answers
    console.log('🗑️ Deleting all existing questions...');
    if (quiz.questions && quiz.questions.length > 0) {
      for (const existingQuestion of quiz.questions) {
        console.log(`🗑️ Deleting question: ${existingQuestion.questionId}`);
        
        // Delete all answers for this question
        if (existingQuestion.answers && existingQuestion.answers.length > 0) {
          await this.answerRepository.remove(existingQuestion.answers);
          console.log(`🗑️ Deleted ${existingQuestion.answers.length} answers`);
        }
        
        // Delete the question
        await this.questionRepository.remove(existingQuestion);
        console.log(`🗑️ Deleted question: ${existingQuestion.questionId}`);
      }
    }
    console.log('✅ All existing questions deleted');

    // 📝 STEP 2: Add all new questions
    console.log('📝 Adding new questions...');
    for (let i = 0; i < updateQuizzDto.questions.length; i++) {
      const questionDto = updateQuizzDto.questions[i];
      console.log(
        `📝 Adding question ${i + 1}:`,
        questionDto.question?.substring(0, 50) + '...',
      );
      // Since we deleted all existing questions, always create new ones
      const question = new Questionentity();
      question.questionId = uuidv4();
      question.question = questionDto.question;
      question.difficulty = questionDto.difficulty || 'medium';
      question.weight = questionDto.weight || 1;
      question.quizz = quiz;
      const savedQuestion = await this.questionRepository.save(question);
      console.log(`✅ Question ${i + 1} saved:`, savedQuestion.questionId);

      // Kiểm tra có ít nhất một câu trả lời đúng
      const hasCorrectAnswer = questionDto.answers.some((a) => a.isCorrect);
      if (!hasCorrectAnswer) {
        throw new BadRequestException(
          `Question "${questionDto.question}" must have at least one correct answer`,
        );
      }

      console.log(
        `📝 Adding ${questionDto.answers.length} answers for question ${i + 1}...`,
      );
      for (let j = 0; j < questionDto.answers.length; j++) {
        const answerDto = questionDto.answers[j];
        
        // Since we deleted all existing answers, always create new ones
        const answer = new AnswerEntity();
        answer.answerId = uuidv4();
        answer.answer = answerDto.answer;
        answer.isCorrect = answerDto.isCorrect;
        answer.question = question;
        const savedAnswer = await this.answerRepository.save(answer);
        console.log(
          `✅ Answer ${j + 1} saved:`,
          savedAnswer.answerId,
          `(correct: ${savedAnswer.isCorrect})`,
        );
      }
    }



    return this.getQuizById(quizzId, courseId, lessonId, contentId);
  }

  async deleteAllQuestions(
    quizzId: string,
    courseId?: string,
    lessonId?: string,
    contentId?: string,
  ) {
    console.log('🗑️ Deleting all questions from quiz:', { 
      quizzId, 
      courseId, 
      lessonId, 
      contentId 
    });

    const queryOptions: any = {
      where: { quizzId },
      relations: ['questions', 'questions.answers'],
    };

    // Validate hierarchy if provided
    if (contentId && courseId && lessonId) {
      queryOptions.where = {
        quizzId,
        contentId,
        contents: {
          contentId,
          lesson: {
            lessonId,
            course: { courseId }
          }
        }
      };
      queryOptions.relations.push(
        'contents',
        'contents.lesson',
        'contents.lesson.course',
      );
    }

    const quiz = await this.quizzRepository.findOne(queryOptions);

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${quizzId} not found`);
    }

    if (!quiz.questions || quiz.questions.length === 0) {
      return { message: 'No questions found to delete', deletedCount: 0 };
    }

    const questionsCount = quiz.questions.length;

    // Delete answers first, then questions
    for (const question of quiz.questions) {
      if (question.answers && question.answers.length > 0) {
        await this.answerRepository.remove(question.answers);
      }
    }

    // Now delete all questions
    await this.questionRepository.remove(quiz.questions);

    return { 
      message: `Successfully deleted all ${questionsCount} questions`,
      deletedCount: questionsCount 
    };
  }

  async getRandomQuiz(
    contentId: string,
    quizzId?: string,
    numberOfQuestions = 10,
    courseId?: string,
    lessonId?: string,
  ) {
    // Nếu có courseId và lessonId thì kiểm tra mối quan hệ
    if (courseId && lessonId) {
      await this.validateHierarchy(contentId, courseId, lessonId);
    }

    const quizzes = await this.getQuizzesByContentId(
      contentId,
      courseId,
      lessonId,
    );

    if (!quizzes.length) {
      throw new NotFoundException(
        `No quizzes found for content ID ${contentId}`,
      );
    }

    const quiz = quizzId
      ? quizzes.find((q) => q.quizzId === quizzId)
      : quizzes[0];

    if (!quiz) {
      throw new NotFoundException(
        `Quiz ID ${quizzId} không thuộc content ID ${contentId}`,
      );
    }

    // Use balanced question selection with proper shuffle
    const selectedQuestions = QuizUtils.getBalancedQuestions(
      quiz.questions,
      Math.min(quiz.questions.length, numberOfQuestions)
    );

    return {
      ...quiz,
      questions: selectedQuestions,
    };
  }

  async deleteQuestion(
    quizzId: string,
    questionId: string,
    courseId?: string,
    lessonId?: string,
    contentId?: string,
  ) {
    const queryOptions: any = {
      where: { quizzId },
      relations: ['questions', 'questions.answers', 'contents'],
    };

    // Nếu có contentId, courseId, lessonId thì thêm điều kiện để kiểm tra mối quan hệ
    if (contentId && courseId && lessonId) {
      queryOptions.where = {
        quizzId,
        contentId,
        contents: {
          contentId,
          lesson: {
            lessonId,
            course: { courseId }
          }
        }
      };
      queryOptions.relations.push('contents.lesson', 'contents.lesson.course');
    }

    const quiz = await this.quizzRepository.findOne(queryOptions);

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${quizzId} not found`);
    }

    const question = await this.questionRepository.findOne({
      where: {
        questionId,
        quizz: { quizzId },
      },
      relations: ['answers'],
    });

    if (!question) {
      throw new NotFoundException(
        `Question with ID ${questionId} not found in Quiz ${quizzId}`,
      );
    }

    await this.answerRepository.delete({ question: { questionId } });

    await this.questionRepository.delete({ questionId });

    return {
      message: `Question with ID ${questionId} has been deleted from Quiz ${quizzId}`,
    };
  }

  async deleteQuiz(
    contentId: string,
    quizzId?: string,
    courseId?: string,
    lessonId?: string,
  ) {
    const queryRunner =
      this.quizzRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Nếu có courseId và lessonId thì kiểm tra mối quan hệ
      if (courseId && lessonId) {
        await this.validateHierarchy(contentId, courseId, lessonId);
      }

      // Tìm quiz dựa trên contentId
      const queryOptions: any = {
        where: {
          contents: { contentId },
        },
        relations: ['questions', 'questions.answers', 'contents'],
      };

      // Nếu có quizzId thì thêm điều kiện
      if (quizzId) {
        queryOptions.where.quizzId = quizzId;
      }

      const quiz = await this.quizzRepository.findOne(queryOptions);

      if (!quiz) {
        throw new NotFoundException(
          `No quiz found for content ID ${contentId}${quizzId ? ` and quiz ID ${quizzId}` : ''}`,
        );
      }

      // Xóa các answers liên quan
      for (const question of quiz.questions) {
        await this.answerRepository.delete({
          question: { questionId: question.questionId },
        });
      }

      // Xóa các questions liên quan
      await this.questionRepository.delete({
        quizz: { quizzId: quiz.quizzId },
      });

      // Xóa quiz khỏi bảng quizz_store (nếu có)
      await queryRunner.manager.query(
        'DELETE FROM quizz_store WHERE quizz_id = $1',
        [quiz.quizzId],
      );

      // Xóa quiz chính
      await queryRunner.manager.delete(Quizz, { quizzId: quiz.quizzId });

      await queryRunner.commitTransaction();

      return {
        message: `Quiz with ID ${quiz.quizzId} and all related questions and answers have been deleted`,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}