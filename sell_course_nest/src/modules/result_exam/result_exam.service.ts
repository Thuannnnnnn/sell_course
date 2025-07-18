import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ResultExam } from './entities/result_exam.entity';
import { Exam } from '../exam/entities/exam.entity';
import { User } from '../user/entities/user.entity';
import { Certificate } from '../certificate/entities/certificate.entity';
import { SubmitExamDto } from './dto/submit-exam.dto';
import { CertificateService } from '../certificate/certificate.service';
import { CreateCertificateDto } from '../certificate/dto/create-certificate.dto';

@Injectable()
export class ResultExamService {
  constructor(
    @InjectRepository(ResultExam)
    private resultExamRepository: Repository<ResultExam>,
    @InjectRepository(Exam)
    private examRepository: Repository<Exam>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Certificate)
    private certificateRepository: Repository<Certificate>,
    private certificateService: CertificateService,
  ) {}

  async submitExam(email: string, submitExamDto: SubmitExamDto) {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const exam = await this.examRepository.findOne({
      where: { courseId: submitExamDto.courseId },
      relations: ['questions', 'questions.answers', 'course'], // Thêm course relation
    });
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    const questionsMap = new Map(exam.questions.map((q) => [q.questionId, q]));
    const answersMap = new Map(
      exam.questions.flatMap((q) => q.answers.map((a) => [a.answerId, a])),
    );

    // Check if the user has already submitted an exam for the given courseId
    const existingResult = await this.resultExamRepository.findOne({
      where: {
        user: { email },
        exam: { courseId: submitExamDto.courseId },
      },
    });

    if (existingResult) {
      await this.resultExamRepository.remove(existingResult);
    }

    let score = 0;
    const answersResult = [];

    // Iterate over the answers submitted by the user
    for (const submission of submitExamDto.answers) {
      const question = questionsMap.get(submission.questionId);
      const selectedAnswer = answersMap.get(submission.answerId);

      if (!question || !selectedAnswer) {
        continue;
      }

      const isCorrect = selectedAnswer.isCorrect;
      if (isCorrect) {
        score++;
      }

      answersResult.push({
        questionId: submission.questionId,
        answerId: submission.answerId,
        isCorrect,
      });
    }

    // Calculate the score as a percentage based on the selected questions
    let totalQuestions;
    if (exam.questions.length > 10) {
      totalQuestions = 10;
    } else {
      totalQuestions = exam.questions.length;
    }
    let percentageScore = (score / totalQuestions) * 100;
    percentageScore = parseFloat(percentageScore.toFixed(2));

    // Create and save exam result
    const resultExam = this.resultExamRepository.create({
      resultExamId: uuidv4(),
      user,
      email: user.email,
      exam,
      score: percentageScore,
      answers: answersResult,
    });

    const savedResult = await this.resultExamRepository.save(resultExam);

    // Auto-generate certificate if passing score (80% or higher)
    const passingScore = 80;
    if (percentageScore >= passingScore) {
      await this.generateCertificateForUser(user, exam, percentageScore);
    }

    return savedResult;
  }

  private async generateCertificateForUser(user: User, exam: any, score: number) {
    try {
      // Check if certificate already exists for this user and course
      const existingCertificate = await this.certificateRepository.findOne({
        where: {
          user: { user_id: user.user_id },
          course: { courseId: exam.courseId },
        },
      });

      if (existingCertificate) {
        console.log(`Certificate already exists for user ${user.email} and course ${exam.courseId}`);
        return existingCertificate;
      }

      // Create certificate DTO
      const createCertificateDto: CreateCertificateDto = {
        courseId: exam.courseId,
        userId: user.user_id,
        title: `Certificate of Completion - ${exam.course?.title || 'Course'}`,
      };

      // Use CertificateService to create certificate and send email
      const certificate = await this.certificateService.create(createCertificateDto);
      
      console.log(`Certificate created successfully for user ${user.email} with score ${score}%`);
      return certificate;
    } catch (error) {
      console.error('Error generating certificate:', error);
      // Don't throw error to avoid breaking exam submission
      // Just log the error and continue
    }
  }

  async getUserExamResults(email: string, courseId: string) {
    const results = await this.resultExamRepository.findOne({
      where: {
        user: { email },
        exam: { courseId },
      },
      relations: ['exam', 'user'],
    });

    if (!results) {
      throw new NotFoundException('Exam results not found');
    }

    return results;
  }

  async getAllUserExamResults(email: string) {
    const results = await this.resultExamRepository.find({
      where: {
        user: { email },
      },
      relations: ['exam', 'user'],
      order: {
        createdAt: 'DESC',
      },
    });

    return results;
  }

  async getQuestionsForUser(courseId: string) {
    const exam = await this.examRepository.findOne({
      where: { courseId },
      relations: ['questions', 'questions.answers'],
    });
    console.log('Get exam Id', courseId);
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    const shuffledQuestions = exam.questions.sort(() => Math.random() - 0.5);
    const totalQuestionsToReturn = Math.min(10, shuffledQuestions.length);
    return shuffledQuestions.slice(0, totalQuestionsToReturn);
  }

  async getAll(): Promise<ResultExam[]> {
    const results = await this.resultExamRepository.find({
      relations: ['exam', 'user'],
      order: {
        createdAt: 'DESC',
      },
    });

    if (!results || results.length === 0) {
      throw new NotFoundException('No exam results found');
    }

    return results;
  }

  // New method to get user's certificates
  async getUserCertificates(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.certificateService.findByUserId(user.user_id);
  }
}