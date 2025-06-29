import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamQuestion } from './entities/examQuestion.entity';
import { Answer } from './entities/answerExam.entity';
import { Exam } from './entities/exam.entity';
import { Quizz } from '../quizz/entities/quizz.entity';
import { Questionentity } from '../quizz/entities/question.entity';
import { CreateExamDto } from './dto/createExamData.dto';
import { CreateExamFromQuizzesDto } from './dto/createExamFromQuiz.dto';
import { v4 as uuidv4 } from 'uuid';
import { UpdateQuestionDto } from './dto/updateQuestionData.dto';

@Injectable()
export class ExamQuestionService {
  constructor(
    @InjectRepository(ExamQuestion)
    private readonly questionRepository: Repository<ExamQuestion>,
    @InjectRepository(Answer)
    private readonly answerRepository: Repository<Answer>,
    @InjectRepository(Exam)
    private readonly examRepository: Repository<Exam>,
    @InjectRepository(Quizz)
    private readonly quizzRepository: Repository<Quizz>,
    @InjectRepository(Questionentity)
    private readonly quizQuestionRepository: Repository<Questionentity>,
  ) {}

  /**
   * Create exam by copying questions from quizzes in the course
   */
  async createExamFromQuizzes(
    courseId: string,
    examConfig?: {
      questionsPerQuiz?: number;
      totalQuestions?: number;
      includeAllQuizzes?: boolean;
      specificQuizIds?: string[];
    }
  ) {
    if (!courseId) {
      throw new BadRequestException('Course ID is required');
    }

    // Find all quizzes in the course
    const quizzes = await this.quizzRepository.find({
      where: { courseId },
      relations: ['questions', 'questions.answers'],
    });

    if (!quizzes || quizzes.length === 0) {
      throw new BadRequestException('No quizzes found in this course to create exam from');
    }

    // Check if exam already exists
    let exam = await this.examRepository.findOne({
      where: { courseId },
      relations: ['questions', 'questions.answers'],
    });

    if (exam) {
      // Clear existing questions if exam exists
      await this.clearExamQuestions(exam.examId);
    } else {
      // Create new exam
      exam = new Exam();
      exam.examId = uuidv4();
      exam.courseId = courseId;
      exam = await this.examRepository.save(exam);
    }

    // Collect all questions from quizzes
    let allQuizQuestions: Questionentity[] = [];
    
    if (examConfig?.specificQuizIds && examConfig.specificQuizIds.length > 0) {
      // Use only specific quizzes
      const filteredQuizzes = quizzes.filter(quiz => 
        examConfig.specificQuizIds!.includes(quiz.quizzId)
      );
      allQuizQuestions = filteredQuizzes.flatMap(quiz => quiz.questions || []);
    } else {
      // Use all quizzes
      allQuizQuestions = quizzes.flatMap(quiz => quiz.questions || []);
    }

    if (allQuizQuestions.length === 0) {
      throw new BadRequestException('No questions found in the selected quizzes');
    }

    // Apply question limits if specified
    let selectedQuestions = allQuizQuestions;
    
    if (examConfig?.questionsPerQuiz && examConfig.questionsPerQuiz > 0) {
      // Limit questions per quiz
      selectedQuestions = [];
      for (const quiz of quizzes) {
        if (quiz.questions && quiz.questions.length > 0) {
          const shuffled = this.shuffleArray([...quiz.questions]);
          selectedQuestions.push(...shuffled.slice(0, examConfig.questionsPerQuiz));
        }
      }
    }

    if (examConfig?.totalQuestions && examConfig.totalQuestions > 0) {
      // Limit total questions
      selectedQuestions = this.shuffleArray(selectedQuestions).slice(0, examConfig.totalQuestions);
    }

    // Copy questions from quiz to exam
    for (const quizQuestion of selectedQuestions) {
      await this.copyQuizQuestionToExam(quizQuestion, exam);
    }

    return this.getExamById(courseId);
  }

  /**
   * Copy a quiz question to exam format
   */
  private async copyQuizQuestionToExam(quizQuestion: Questionentity, exam: Exam) {
    const examQuestion = new ExamQuestion();
    examQuestion.questionId = uuidv4();
    examQuestion.question = quizQuestion.question;
    examQuestion.difficulty = quizQuestion.difficulty || 'medium';
    examQuestion.weight = quizQuestion.weight || 1;
    examQuestion.exam = exam;

    const savedQuestion = await this.questionRepository.save(examQuestion);

    // Copy answers
    if (quizQuestion.answers && quizQuestion.answers.length > 0) {
      for (const quizAnswer of quizQuestion.answers) {
        const examAnswer = new Answer();
        examAnswer.answerId = uuidv4();
        examAnswer.answer = quizAnswer.answer;
        examAnswer.isCorrect = quizAnswer.isCorrect;
        examAnswer.question = savedQuestion;
        await this.answerRepository.save(examAnswer);
      }
    }
  }

  /**
   * Clear all questions from an exam
   * 🔧 Fixed: Added proper error handling and null checks
   */
  private async clearExamQuestions(examId: string) {
    if (!examId) {
      return; // Early return if no examId provided
    }

    const exam = await this.examRepository.findOne({
      where: { examId },
      relations: ['questions', 'questions.answers'],
    });

    if (!exam) {
      return; // Early return if exam doesn't exist
    }

    if (exam.questions && exam.questions.length > 0) {
      for (const question of exam.questions) {
        // Delete answers first
        if (question.answers && question.answers.length > 0) {
          await this.answerRepository.delete({
            question: { questionId: question.questionId },
          });
        }
      }
      // Delete questions
      await this.questionRepository.delete({ exam: { examId } });
    }
  }

  /**
   * Utility function to shuffle array
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Create exam with custom questions (original method)
   * 🔧 Fixed: Added better validation
   */
  async createExam(dto: CreateExamDto) {
    if (!dto.questions || dto.questions.length === 0) {
      throw new BadRequestException('No questions provided.');
    }

    if (!dto.courseId || dto.courseId.trim() === '') {
      throw new BadRequestException('Course ID is required.');
    }

    let exam = await this.examRepository.findOne({
      where: { courseId: dto.courseId },
    });

    if (!exam) {
      exam = new Exam();
      exam.examId = uuidv4();
      exam.courseId = dto.courseId;
      exam = await this.examRepository.save(exam);
    } else {
      // Clear existing questions if exam already exists
      await this.clearExamQuestions(exam.examId);
    }

    // Validate each question has at least one correct answer
    for (const questionDto of dto.questions) {
      if (!questionDto.question || questionDto.question.trim() === '') {
        throw new BadRequestException(
          `Invalid question: "${questionDto.question}"`,
        );
      }

      if (!questionDto.answers || questionDto.answers.length === 0) {
        throw new BadRequestException(
          `No answers provided for question: "${questionDto.question}"`,
        );
      }

      // Check if at least one answer is correct
      const hasCorrectAnswer = questionDto.answers.some(answer => answer.isCorrect);
      if (!hasCorrectAnswer) {
        throw new BadRequestException(
          `Question "${questionDto.question}" must have at least one correct answer`,
        );
      }

      const question = new ExamQuestion();
      question.questionId = uuidv4();
      question.question = questionDto.question.trim();
      question.difficulty = questionDto.difficulty || 'medium';
      question.weight = questionDto.weight || 1;
      question.exam = exam;
      const savedQuestion = await this.questionRepository.save(question);

      for (const answerDto of questionDto.answers) {
        if (!answerDto.answer || answerDto.answer.trim() === '') {
          throw new BadRequestException('Invalid answer text');
        }

        const answer = new Answer();
        answer.answerId = uuidv4();
        answer.answer = answerDto.answer.trim();
        answer.isCorrect = answerDto.isCorrect;
        answer.question = savedQuestion;
        await this.answerRepository.save(answer);
      }
    }

    return this.getExamById(exam.courseId);
  }

  /**
   * Sync exam with latest quiz questions
   */
  async syncExamWithQuizzes(courseId: string) {
    if (!courseId || courseId.trim() === '') {
      throw new BadRequestException('Course ID is required');
    }

    const exam = await this.examRepository.findOne({
      where: { courseId },
      relations: ['questions'],
    });

    if (!exam) {
      // Create new exam from quizzes
      return this.createExamFromQuizzes(courseId);
    }

    // Clear existing questions and recreate from quizzes
    await this.clearExamQuestions(exam.examId);
    return this.createExamFromQuizzes(courseId);
  }

  /**
   * Get available quizzes for exam creation
   */
  async getAvailableQuizzesForExam(courseId: string) {
    if (!courseId || courseId.trim() === '') {
      throw new BadRequestException('Course ID is required');
    }

    const quizzes = await this.quizzRepository.find({
      where: { courseId },
      relations: ['questions'],
      select: ['quizzId', 'courseId', 'lessonId', 'contentId'],
    });

    return quizzes.map(quiz => ({
      quizzId: quiz.quizzId,
      courseId: quiz.courseId,
      lessonId: quiz.lessonId,
      contentId: quiz.contentId,
      questionCount: quiz.questions?.length || 0,
    }));
  }

  /**
   * Get exam by course ID
   * 🔧 Fixed: Added better validation
   */
  async getExamById(courseId: string) {
    if (!courseId || courseId.trim() === '') {
      throw new BadRequestException('Course ID is required');
    }

    const exam = await this.examRepository.findOne({
      where: { courseId },
      relations: ['questions', 'questions.answers'],
    });
    
    if (!exam) {
      throw new NotFoundException(`Exam with courseId ${courseId} not found`);
    }
    return exam;
  }

  /**
   * Delete entire exam
   */
  async deleteExam(examId: string) {
    if (!examId || examId.trim() === '') {
      throw new BadRequestException('Exam ID is required');
    }

    const exam = await this.examRepository.findOne({
      where: { examId },
      relations: ['questions', 'questions.answers'],
    });

    if (!exam) {
      throw new NotFoundException(`Exam with id ${examId} not found`);
    }

    await this.clearExamQuestions(examId);
    await this.examRepository.delete({ examId });

    return { message: `Exam with id ${examId} deleted successfully.` };
  }

  /**
   * Delete a specific question from exam
   */
  async deleteQuestion(questionId: string) {
    if (!questionId || questionId.trim() === '') {
      throw new BadRequestException('Question ID is required');
    }

    const question = await this.questionRepository.findOne({
      where: { questionId },
      relations: ['answers'],
    });

    if (!question) {
      throw new NotFoundException(`Question with id ${questionId} not found`);
    }

    await this.answerRepository.delete({ question: { questionId } });
    await this.questionRepository.delete({ questionId });

    return { message: `Question with id ${questionId} deleted successfully.` };
  }

  /**
   * Update a specific question
   * 🔧 Fixed: Better validation and error handling
   */
  async updateQuestion(questionId: string, dto: UpdateQuestionDto) {
    if (!questionId || questionId.trim() === '') {
      throw new BadRequestException('Question ID is required');
    }

    if (!dto.question || dto.question.trim() === '') {
      throw new BadRequestException('Question text is required');
    }

    const question = await this.questionRepository.findOne({
      where: { questionId },
      relations: ['answers'],
    });

    if (!question) {
      throw new NotFoundException(`Question with id ${questionId} not found`);
    }

    // Update question properties
    question.question = dto.question.trim();
    if (dto.difficulty) {
      question.difficulty = dto.difficulty;
    }
    if (dto.weight !== undefined) {
      question.weight = dto.weight;
    }
    await this.questionRepository.save(question);

    // Update answers
    if (dto.answers && dto.answers.length > 0) {
      // Check if at least one answer is correct
      const hasCorrectAnswer = dto.answers.some(answer => answer.isCorrect);
      if (!hasCorrectAnswer) {
        throw new BadRequestException('Question must have at least one correct answer');
      }

      for (const answerDto of dto.answers) {
        if (!answerDto.answer || answerDto.answer.trim() === '') {
          throw new BadRequestException('Answer text cannot be empty');
        }

        const existingAnswer = question.answers.find(
          (a) => a.answerId === answerDto.answerId,
        );

        if (existingAnswer) {
          // Update existing answer
          existingAnswer.answer = answerDto.answer.trim();
          existingAnswer.isCorrect = answerDto.isCorrect;
          await this.answerRepository.save(existingAnswer);
        } else if (answerDto.answerId) {
          // Handle case where answerId is provided but answer doesn't exist
          throw new NotFoundException(`Answer with id ${answerDto.answerId} not found`);
        } else {
          // Create new answer if no answerId provided
          const newAnswer = new Answer();
          newAnswer.answerId = uuidv4();
          newAnswer.answer = answerDto.answer.trim();
          newAnswer.isCorrect = answerDto.isCorrect;
          newAnswer.question = question;
          await this.answerRepository.save(newAnswer);
        }
      }
    }

    return this.getQuestionById(questionId);
  }

  /**
   * Get question by ID
   */
  async getQuestionById(questionId: string) {
    if (!questionId || questionId.trim() === '') {
      throw new BadRequestException('Question ID is required');
    }

    const question = await this.questionRepository.findOne({
      where: { questionId },
      relations: ['answers'],
    });

    if (!question) {
      throw new NotFoundException(`Question with id ${questionId} not found`);
    }

    return question;
  }

  /**
   * Get exam statistics
   */
  async getExamStats(courseId: string) {
    if (!courseId || courseId.trim() === '') {
      throw new BadRequestException('Course ID is required');
    }

    const exam = await this.getExamById(courseId);
    
    const stats = {
      totalQuestions: exam.questions.length,
      questionsByDifficulty: {
        easy: exam.questions.filter(q => q.difficulty === 'easy').length,
        medium: exam.questions.filter(q => q.difficulty === 'medium').length,
        hard: exam.questions.filter(q => q.difficulty === 'hard').length,
      },
      totalWeight: exam.questions.reduce((sum, q) => sum + (q.weight || 1), 0),
      averageWeight: exam.questions.length > 0 
        ? exam.questions.reduce((sum, q) => sum + (q.weight || 1), 0) / exam.questions.length 
        : 0
    };
    
    return stats;
  }

  /**
   * Check if exam exists for a course
   */
  async checkExamExists(courseId: string): Promise<boolean> {
    if (!courseId || courseId.trim() === '') {
      return false;
    }

    try {
      await this.getExamById(courseId);
      return true;
    } catch (error) {
      if (error instanceof NotFoundException) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get exam for student view (without correct answers)
   */
  async getExamForStudent(courseId: string) {
    if (!courseId || courseId.trim() === '') {
      throw new BadRequestException('Course ID is required');
    }

    const exam = await this.getExamById(courseId);
    
    // Remove correct answer information for student view
    return {
      examId: exam.examId,
      courseId: exam.courseId,
      questions: exam.questions.map(question => ({
        questionId: question.questionId,
        question: question.question,
        difficulty: question.difficulty,
        weight: question.weight,
        answers: question.answers.map(answer => ({
          answerId: answer.answerId,
          answer: answer.answer,
        }))
      }))
    };
  }

  /**
   * Add single question to existing exam
   */
  async addQuestionToExam(courseId: string, questionData: {
    question: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    weight?: number;
    answers: Array<{
      answer: string;
      isCorrect: boolean;
    }>;
  }) {
    if (!courseId || courseId.trim() === '') {
      throw new BadRequestException('Course ID is required');
    }

    if (!questionData.question || questionData.question.trim() === '') {
      throw new BadRequestException('Question text is required');
    }

    if (!questionData.answers || questionData.answers.length === 0) {
      throw new BadRequestException('At least one answer is required');
    }

    // Check if at least one answer is correct
    const hasCorrectAnswer = questionData.answers.some(answer => answer.isCorrect);
    if (!hasCorrectAnswer) {
      throw new BadRequestException('Question must have at least one correct answer');
    }

    const exam = await this.examRepository.findOne({
      where: { courseId },
    });

    if (!exam) {
      throw new NotFoundException(`Exam with courseId ${courseId} not found`);
    }

    const question = new ExamQuestion();
    question.questionId = uuidv4();
    question.question = questionData.question.trim();
    question.difficulty = questionData.difficulty || 'medium';
    question.weight = questionData.weight || 1;
    question.exam = exam;
    const savedQuestion = await this.questionRepository.save(question);

    for (const answerData of questionData.answers) {
      if (!answerData.answer || answerData.answer.trim() === '') {
        throw new BadRequestException('Answer text cannot be empty');
      }

      const answer = new Answer();
      answer.answerId = uuidv4();
      answer.answer = answerData.answer.trim();
      answer.isCorrect = answerData.isCorrect;
      answer.question = savedQuestion;
      await this.answerRepository.save(answer);
    }

    return this.getQuestionById(savedQuestion.questionId);
  }
}