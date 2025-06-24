import { Questionentity } from '../entities/question.entity';
import { AnswerResult, ScoreResult, ScoreBreakdown, DetailedAnalysis, DifficultyStats, TopicStats } from '../../quizz_store/interfaces/score-analysis.interface';

export class QuizUtils {
  /**
   * Fisher-Yates shuffle algorithm for fair randomization
   */
  static fisherYatesShuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Get balanced questions with proper difficulty distribution
   */
  static getBalancedQuestions(
    questions: Questionentity[], 
    count: number
  ): Questionentity[] {
    const easy = questions.filter(q => q.difficulty === 'easy');
    const medium = questions.filter(q => q.difficulty === 'medium');
    const hard = questions.filter(q => q.difficulty === 'hard');
    
    // Distribution: 40% easy, 40% medium, 20% hard
    const easyCount = Math.floor(count * 0.4);
    const hardCount = Math.floor(count * 0.2);
    const mediumCount = count - easyCount - hardCount;
    
    const selectedQuestions: Questionentity[] = [];
    
    // Add easy questions
    if (easy.length > 0) {
      selectedQuestions.push(
        ...this.fisherYatesShuffle(easy).slice(0, Math.min(easyCount, easy.length))
      );
    }
    
    // Add medium questions
    if (medium.length > 0) {
      selectedQuestions.push(
        ...this.fisherYatesShuffle(medium).slice(0, Math.min(mediumCount, medium.length))
      );
    }
    
    // Add hard questions
    if (hard.length > 0) {
      selectedQuestions.push(
        ...this.fisherYatesShuffle(hard).slice(0, Math.min(hardCount, hard.length))
      );
    }
    
    // If we don't have enough questions, fill with remaining questions
    if (selectedQuestions.length < count) {
      const remaining = questions.filter(q => 
        !selectedQuestions.some(sq => sq.questionId === q.questionId)
      );
      selectedQuestions.push(
        ...this.fisherYatesShuffle(remaining).slice(0, count - selectedQuestions.length)
      );
    }
    
    return this.fisherYatesShuffle(selectedQuestions).slice(0, count);
  }

  /**
   * Calculate detailed score with weighted system
   */
  static calculateScore(
    answers: AnswerResult[], 
    questions: Questionentity[]
  ): ScoreResult {
    let totalWeight = 0;
    let earnedWeight = 0;
    
    const questionMap = new Map(questions.map(q => [q.questionId, q]));
    const breakdown = this.calculateScoreBreakdown(answers, questions);
    
    for (const answer of answers) {
      const question = questionMap.get(answer.questionId);
      if (!question) continue;
      
      const weight = question.weight || 1;
      totalWeight += weight;
      
      if (answer.isCorrect) {
        earnedWeight += weight;
      }
    }
    
    const percentage = totalWeight > 0 ? (earnedWeight / totalWeight) * 100 : 0;
    
    return {
      rawScore: earnedWeight,
      totalPossible: totalWeight,
      percentage: Math.round(percentage * 100) / 100, // 2 decimal places
      breakdown
    };
  }

  /**
   * Calculate detailed breakdown by difficulty and topic
   */
  private static calculateScoreBreakdown(
    answers: AnswerResult[], 
    questions: Questionentity[]
  ): ScoreBreakdown {
    const questionMap = new Map(questions.map(q => [q.questionId, q]));
    
    const difficultyStats = {
      easy: { correct: 0, total: 0, percentage: 0, weightedScore: 0, totalWeight: 0 },
      medium: { correct: 0, total: 0, percentage: 0, weightedScore: 0, totalWeight: 0 },
      hard: { correct: 0, total: 0, percentage: 0, weightedScore: 0, totalWeight: 0 }
    };
    
    const topicStats = new Map<string, TopicStats>();
    
    for (const answer of answers) {
      const question = questionMap.get(answer.questionId);
      if (!question) continue;
      
      const weight = question.weight || 1;
      const difficulty = question.difficulty || 'medium';
      
      // Update difficulty stats
      difficultyStats[difficulty].total++;
      difficultyStats[difficulty].totalWeight += weight;
      
      if (answer.isCorrect) {
        difficultyStats[difficulty].correct++;
        difficultyStats[difficulty].weightedScore += weight;
      }
      
      // Update topic stats
      if (question.tags && question.tags.length > 0) {
        for (const tag of question.tags) {
          if (!topicStats.has(tag)) {
            topicStats.set(tag, { correct: 0, total: 0, percentage: 0 });
          }
          const stats = topicStats.get(tag)!;
          stats.total++;
          if (answer.isCorrect) {
            stats.correct++;
          }
        }
      }
    }
    
    // Calculate percentages
    Object.keys(difficultyStats).forEach(key => {
      const stats = difficultyStats[key as keyof typeof difficultyStats];
      stats.percentage = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
    });
    
    topicStats.forEach((stats) => {
      stats.percentage = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
    });
    
    return {
      byDifficulty: difficultyStats,
      byTopic: Object.fromEntries(topicStats)
    };
  }

  /**
   * Analyze performance and provide insights
   */
  static analyzePerformance(
    answers: AnswerResult[], 
    questions: Questionentity[]
  ): DetailedAnalysis {
    const breakdown = this.calculateScoreBreakdown(answers, questions);
    
    const strongAreas: string[] = [];
    const weakAreas: string[] = [];
    const overallInsights: string[] = [];
    
    // Analyze topic performance
    Object.entries(breakdown.byTopic).forEach(([topic, stats]) => {
      if (stats.percentage >= 80) {
        strongAreas.push(topic);
      } else if (stats.percentage < 60) {
        weakAreas.push(topic);
      }
    });
    
    // Generate insights based on difficulty performance
    const { easy, medium, hard } = breakdown.byDifficulty;
    
    if (easy.percentage < 70) {
      overallInsights.push('Cần ôn tập lại các kiến thức cơ bản');
    }
    
    if (medium.percentage >= 80 && hard.percentage >= 70) {
      overallInsights.push('Bạn đã nắm vững kiến thức, có thể thử thách với các bài tập nâng cao hơn');
    }
    
    if (hard.percentage > easy.percentage) {
      overallInsights.push('Bạn có khả năng tư duy tốt nhưng cần chú ý hơn đến các chi tiết cơ bản');
    }
    
    const totalQuestions = answers.length;
    if (totalQuestions > 0) {
      const correctAnswers = answers.filter(a => a.isCorrect).length;
      const overallPercentage = (correctAnswers / totalQuestions) * 100;
      
      if (overallPercentage >= 90) {
        overallInsights.push('Kết quả xuất sắc! Bạn đã thành thạo chủ đề này');
      } else if (overallPercentage >= 70) {
        overallInsights.push('Kết quả tốt, tiếp tục duy trì và cải thiện');
      } else if (overallPercentage >= 50) {
        overallInsights.push('Cần ôn tập thêm để nắm vững kiến thức');
      } else {
        overallInsights.push('Nên xem lại tài liệu học tập và thực hành thêm');
      }
    }
    
    return {
      strongAreas,
      weakAreas,
      recommendedStudyTopics: weakAreas,
      difficultyPerformance: breakdown.byDifficulty,
      overallInsights
    };
  }
}