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
import { ExamUtils, ExamAnswerResult } from '../exam/utils/exam.utils';

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
      relations: ['questions', 'questions.answers', 'course'],
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

    // Prepare answers for weighted scoring system
    const examAnswerResults: ExamAnswerResult[] = [];
    const answersResult = [];

    // Process submitted answers
    for (const submission of submitExamDto.answers) {
      const question = questionsMap.get(submission.questionId);
      const selectedAnswer = answersMap.get(submission.answerId);

      if (!question || !selectedAnswer) {
        continue;
      }

      const isCorrect = selectedAnswer.isCorrect;

      // For ExamUtils calculation
      examAnswerResults.push({
        questionId: submission.questionId,
        selectedAnswerId: submission.answerId,
        isCorrect,
      });

      // For database storage (keeping existing format)
      answersResult.push({
        questionId: submission.questionId,
        selectedAnswerId: submission.answerId, // Changed from answerId to selectedAnswerId
        isCorrect,
      });
    }

    // Get the questions that were actually answered for scoring
    const answeredQuestions = exam.questions.filter(q =>
      examAnswerResults.some(ar => ar.questionId === q.questionId)
    );

    // Calculate weighted score using ExamUtils
    const scoreResult = ExamUtils.calculateScore(examAnswerResults, answeredQuestions);
    const percentageScore = scoreResult.percentage;

    // Get detailed analysis
    const detailedAnalysis = ExamUtils.analyzePerformance(examAnswerResults, answeredQuestions);

    // Get performance grade
    const performanceGrade = ExamUtils.getPerformanceGrade(percentageScore);

    // Create and save exam result with weighted score
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

    // Return enhanced result with detailed analysis
    return {
      ...savedResult,
      detailedAnalysis,
      performanceGrade,
      scoreBreakdown: scoreResult.breakdown,
      weightedScore: {
        rawScore: scoreResult.rawScore,
        totalPossible: scoreResult.totalPossible,
        percentage: scoreResult.percentage,
      },
      studyRecommendations: ExamUtils.getStudyRecommendations(detailedAnalysis),
      isPassed: ExamUtils.isExamPassed(percentageScore, passingScore),
    };
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
      relations: ['exam', 'user', 'exam.questions', 'exam.questions.answers'],
    });

    if (!results) {
      throw new NotFoundException('Exam results not found');
    }

    // Enhance results with detailed analysis if answers exist
    if (results.answers && results.answers.length > 0) {
      const examAnswerResults: ExamAnswerResult[] = results.answers.map(answer => ({
        questionId: answer.questionId,
        selectedAnswerId: answer.selectedAnswerId, // Fixed: only use selectedAnswerId
        isCorrect: answer.isCorrect,
      }));

      const answeredQuestions = results.exam.questions?.filter(q =>
        examAnswerResults.some(ar => ar.questionId === q.questionId)
      ) || [];

      if (answeredQuestions.length > 0) {
        const detailedAnalysis = ExamUtils.analyzePerformance(examAnswerResults, answeredQuestions);
        const performanceGrade = ExamUtils.getPerformanceGrade(results.score);
        const scoreResult = ExamUtils.calculateScore(examAnswerResults, answeredQuestions);

        return {
          ...results,
          detailedAnalysis,
          performanceGrade,
          scoreBreakdown: scoreResult.breakdown,
          studyRecommendations: ExamUtils.getStudyRecommendations(detailedAnalysis),
          isPassed: ExamUtils.isExamPassed(results.score),
        };
      }
    }

    // Add basic performance grade even if no detailed analysis
    return {
      ...results,
      performanceGrade: ExamUtils.getPerformanceGrade(results.score),
      isPassed: ExamUtils.isExamPassed(results.score),
    };
  }

  async getAllUserExamResults(email: string) {
    const results = await this.resultExamRepository.find({
      where: {
        user: { email },
      },
      relations: ['exam', 'user', 'exam.questions', 'exam.questions.answers'],
      order: {
        createdAt: 'DESC',
      },
    });

    // Enhance each result with detailed analysis
    const enhancedResults = results.map(result => {
      if (result.answers && result.answers.length > 0) {
        const examAnswerResults: ExamAnswerResult[] = result.answers.map(answer => ({
          questionId: answer.questionId,
          selectedAnswerId: answer.selectedAnswerId, // Fixed: only use selectedAnswerId
          isCorrect: answer.isCorrect,
        }));

        const answeredQuestions = result.exam.questions?.filter(q =>
          examAnswerResults.some(ar => ar.questionId === q.questionId)
        ) || [];

        if (answeredQuestions.length > 0) {
          const detailedAnalysis = ExamUtils.analyzePerformance(examAnswerResults, answeredQuestions);
          const performanceGrade = ExamUtils.getPerformanceGrade(result.score);
          const scoreResult = ExamUtils.calculateScore(examAnswerResults, answeredQuestions);

          return {
            ...result,
            detailedAnalysis,
            performanceGrade,
            scoreBreakdown: scoreResult.breakdown,
            studyRecommendations: ExamUtils.getStudyRecommendations(detailedAnalysis),
            isPassed: ExamUtils.isExamPassed(result.score),
          };
        }
      }

      return {
        ...result,
        performanceGrade: ExamUtils.getPerformanceGrade(result.score),
        isPassed: ExamUtils.isExamPassed(result.score),
      };
    });

    return enhancedResults;
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

    // Use balanced question selection from ExamUtils
    const totalQuestionsToReturn = Math.min(10, exam.questions.length);
    return ExamUtils.getBalancedQuestions(exam.questions, totalQuestionsToReturn);
  }

  async getAll(): Promise<ResultExam[]> {
    const results = await this.resultExamRepository.find({
      relations: ['exam', 'user', 'exam.questions', 'exam.questions.answers'],
      order: {
        createdAt: 'DESC',
      },
    });

    if (!results || results.length === 0) {
      throw new NotFoundException('No exam results found');
    }

    // Enhance results with performance grades and additional info
    const enhancedResults = results.map(result => ({
      ...result,
      performanceGrade: ExamUtils.getPerformanceGrade(result.score),
      isPassed: ExamUtils.isExamPassed(result.score),
    }));

    return enhancedResults;
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

  // Enhanced exam statistics with weighted scoring analysis
  async getExamStatistics(courseId?: string) {
    const whereCondition = courseId ? { exam: { courseId } } : {};

    const results = await this.resultExamRepository.find({
      where: whereCondition,
      relations: ['exam', 'user', 'exam.questions', 'exam.questions.answers'],
    });

    if (!results || results.length === 0) {
      return {
        totalAttempts: 0,
        averageScore: 0,
        weightedAverageScore: 0,
        passRate: 0,
        gradeDistribution: {},
        difficultyAnalysis: null,
        performanceInsights: [],
      };
    }

    let totalScore = 0;
    let totalWeightedScore = 0;
    let passCount = 0;
    const gradeDistribution = {
      'A+': 0, 'A': 0, 'A-': 0, 'B+': 0, 'B': 0, 'B-': 0,
      'C+': 0, 'C': 0, 'C-': 0, 'D+': 0, 'D': 0, 'F': 0
    };

    const difficultyStats = {
      easy: { totalAttempts: 0, totalCorrect: 0, totalWeight: 0, earnedWeight: 0 },
      medium: { totalAttempts: 0, totalCorrect: 0, totalWeight: 0, earnedWeight: 0 },
      hard: { totalAttempts: 0, totalCorrect: 0, totalWeight: 0, earnedWeight: 0 },
    };

    for (const result of results) {
      totalScore += result.score;
      if (result.score >= 80) passCount++;

      // Track grade distribution
      const grade = ExamUtils.getPerformanceGrade(result.score);
      gradeDistribution[grade as keyof typeof gradeDistribution]++;

      // Analyze difficulty performance with weighted scoring
      if (result.answers && result.answers.length > 0) {
        const examAnswerResults: ExamAnswerResult[] = result.answers.map(answer => ({
          questionId: answer.questionId,
          selectedAnswerId: answer.selectedAnswerId, // Fixed: only use selectedAnswerId
          isCorrect: answer.isCorrect,
        }));

        const answeredQuestions = result.exam.questions?.filter(q =>
          examAnswerResults.some(ar => ar.questionId === q.questionId)
        ) || [];

        if (answeredQuestions.length > 0) {
          const scoreResult = ExamUtils.calculateScore(examAnswerResults, answeredQuestions);
          totalWeightedScore += scoreResult.percentage;

          // Analyze by difficulty with weights
          for (const question of answeredQuestions) {
            const difficulty = question.difficulty || 'medium';
            const weight = question.weight || 1;
            const answerResult = examAnswerResults.find(ar => ar.questionId === question.questionId);

            if (answerResult) {
              difficultyStats[difficulty].totalAttempts++;
              difficultyStats[difficulty].totalWeight += weight;

              if (answerResult.isCorrect) {
                difficultyStats[difficulty].totalCorrect++;
                difficultyStats[difficulty].earnedWeight += weight;
              }
            }
          }
        }
      }
    }

    const averageScore = totalScore / results.length;
    const weightedAverageScore = totalWeightedScore / results.length;
    const passRate = (passCount / results.length) * 100;

    // Calculate difficulty success rates (both count-based and weight-based)
    const difficultyAnalysis = Object.entries(difficultyStats).reduce((acc, [key, stats]) => {
      acc[key] = {
        successRate: stats.totalAttempts > 0 ? (stats.totalCorrect / stats.totalAttempts) * 100 : 0,
        weightedSuccessRate: stats.totalWeight > 0 ? (stats.earnedWeight / stats.totalWeight) * 100 : 0,
        totalAttempts: stats.totalAttempts,
        totalCorrect: stats.totalCorrect,
        totalWeight: stats.totalWeight,
        earnedWeight: stats.earnedWeight,
      };
      return acc;
    }, {} as any);

    // Generate performance insights
    const performanceInsights: string[] = [];

    if (passRate >= 90) {
      performanceInsights.push('Tỷ lệ đỗ rất cao - Exam có độ khó phù hợp');
    } else if (passRate < 50) {
      performanceInsights.push('Tỷ lệ đỗ thấp - Nên xem xét độ khó của exam');
    }

    if (difficultyAnalysis.easy?.successRate < 70) {
      performanceInsights.push('Học viên gặp khó khăn với câu hỏi cơ bản');
    }

    if (difficultyAnalysis.hard?.successRate > 80) {
      performanceInsights.push('Có thể tăng độ khó của câu hỏi nâng cao');
    }

    const excellentGrades = gradeDistribution['A+'] + gradeDistribution['A'] + gradeDistribution['A-'];
    if (excellentGrades / results.length > 0.3) {
      performanceInsights.push('Nhiều học viên đạt điểm cao - Chất lượng học tập tốt');
    }

    return {
      totalAttempts: results.length,
      averageScore: Math.round(averageScore * 100) / 100,
      weightedAverageScore: Math.round(weightedAverageScore * 100) / 100,
      passRate: Math.round(passRate * 100) / 100,
      gradeDistribution,
      difficultyAnalysis,
      performanceInsights,
    };
  }

  // New method to get exam performance comparison
  async compareExamPerformance(courseIds: string[]) {
    const comparisons = [];

    for (const courseId of courseIds) {
      const stats = await this.getExamStatistics(courseId);
      const exam = await this.examRepository.findOne({
        where: { courseId },
        relations: ['course'],
      });

      comparisons.push({
        courseId,
        courseName: exam?.course?.title || 'Unknown Course',
        stats,
      });
    }

    return comparisons;
  }

  // New method to get learning analytics
  async getLearningAnalytics(email: string) {
    const results = await this.getAllUserExamResults(email);

    if (results.length === 0) {
      return {
        totalExams: 0,
        averageScore: 0,
        improvementTrend: 'No data',
        strongSubjects: [],
        weakSubjects: [],
        recommendations: ['Bắt đầu làm bài thi để có thể phân tích kết quả'],
      };
    }

    const scores = results.map(r => r.score);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    // Calculate improvement trend
    let improvementTrend = 'Stable';
    if (results.length >= 3) {
      const recent = scores.slice(0, 3);
      const earlier = scores.slice(-3);
      const recentAvg = recent.reduce((sum, score) => sum + score, 0) / recent.length;
      const earlierAvg = earlier.reduce((sum, score) => sum + score, 0) / earlier.length;

      if (recentAvg > earlierAvg + 5) {
        improvementTrend = 'Improving';
      } else if (recentAvg < earlierAvg - 5) {
        improvementTrend = 'Declining';
      }
    }

    // Aggregate subject performance (simplified)
    const subjectStats = new Map<string, { total: number, scores: number[] }>();

    for (const result of results) {
      const subject = result.exam?.course?.title || 'General';
      if (!subjectStats.has(subject)) {
        subjectStats.set(subject, { total: 0, scores: [] });
      }
      const stats = subjectStats.get(subject)!;
      stats.total++;
      stats.scores.push(result.score);
    }

    const strongSubjects: string[] = [];
    const weakSubjects: string[] = [];

    subjectStats.forEach((stats, subject) => {
      const avgScore = stats.scores.reduce((sum, score) => sum + score, 0) / stats.scores.length;
      if (avgScore >= 85) {
        strongSubjects.push(subject);
      } else if (avgScore < 70) {
        weakSubjects.push(subject);
      }
    });

    // Generate recommendations
    const recommendations: string[] = [];

    if (averageScore >= 85) {
      recommendations.push('Kết quả xuất sắc! Tiếp tục duy trì phong độ');
    } else if (averageScore >= 70) {
      recommendations.push('Kết quả tốt, hãy cố gắng cải thiện thêm');
    } else {
      recommendations.push('Cần tăng cường ôn tập để cải thiện kết quả');
    }

    if (improvementTrend === 'Declining') {
      recommendations.push('Kết quả có xu hướng giảm, cần xem lại phương pháp học tập');
    } else if (improvementTrend === 'Improving') {
      recommendations.push('Kết quả đang cải thiện tích cực, tiếp tục phát huy');
    }

    if (weakSubjects.length > 0) {
      recommendations.push(`Tập trung cải thiện các môn: ${weakSubjects.join(', ')}`);
    }

    return {
      totalExams: results.length,
      averageScore: Math.round(averageScore * 100) / 100,
      improvementTrend,
      strongSubjects,
      weakSubjects,
      recommendations,
      recentScores: scores.slice(0, 5), // Last 5 scores for trend analysis
    };
  }
}