// Quiz Types for Frontend - Synchronized with Backend

// Basic Types
export interface Answer {
  answerId: string;
  answer: string;
  isCorrect: boolean;
  createdAt: Date;
}

export interface Question {
  questionId: string;
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  weight: number;
  answers: Answer[];
  explanation?: string;
  createdAt: Date;
}

export interface Quiz {
  quizzId: string;
  contentId: string;
  lessonId: string;
  courseId: string;
  questions: Question[];
  createdAt: Date;
}

// For Quiz Taking (User Interface) - Alias for Question
export type QuizQuestion = Question;

// API Response Types
export interface QuizResponse {
  quizzId: string;
  contentId: string;
  lessonId: string;
  courseId: string;
  questions: Question[];
  createdAt: Date;
}

export interface RandomQuizResponse {
  quizzId: string;
  contentId: string;
  lessonId: string;
  courseId: string;
  questions: Question[];
  createdAt: Date;
}

// Submit Quiz Types
export interface AnswerSubmit {
  questionId: string;
  answerId: string;
}

export interface SubmitQuizRequest {
  quizzId: string;
  answers: AnswerSubmit[];
}

// Score Analysis Types - Matching Backend Interfaces
export interface DifficultyStats {
  correct: number;
  total: number;
  percentage: number;
  weightedScore: number;
  totalWeight: number;
}

export interface TopicStats {
  correct: number;
  total: number;
  percentage: number;
}

export interface ScoreBreakdown {
  byDifficulty: {
    easy: DifficultyStats;
    medium: DifficultyStats;
    hard: DifficultyStats;
  };
  byTopic: { [topic: string]: TopicStats };
}

export interface ScoreResult {
  rawScore: number;
  totalPossible: number;
  percentage: number;
  breakdown: ScoreBreakdown;
}

export interface DetailedAnalysis {
  strongAreas: string[];
  weakAreas: string[];
  recommendedStudyTopics: string[];
  difficultyPerformance: {
    easy: DifficultyStats;
    medium: DifficultyStats;
    hard: DifficultyStats;
  };
  overallInsights: string[];
}

export interface QuizFeedback {
  questionId: string;
  userAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  weight: number;
}

// Quiz Result - Main result object (Synchronized with Backend QuizzStore Entity)
export interface QuizResult {
  storeId: string;
  quizzId: string;
  userId: string;
  score: number;
  answers: {
    questionId: string;
    answerId: string | null;
    isCorrect: boolean;
  }[];
  createdAt: Date;
  scoreAnalysis: ScoreResult;
  detailedAnalysis: DetailedAnalysis;
  feedback: QuizFeedback[];
}

export interface QuizResultResponse {
  success: boolean;
  data: QuizResult[];
  message?: string;
}

// Question Analysis for Detailed View
export interface QuestionAnalysis {
  questionId: string;
  question: string;
  userAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  weight: number;
}

export interface DetailedAnalysisResponse {
  success: boolean;
  data: {
    quizResult: QuizResult;
    questionAnalysis: QuestionAnalysis[];
    performanceByDifficulty: {
      easy: DifficultyStats;
      medium: DifficultyStats;
      hard: DifficultyStats;
    };
  };
  message?: string;
}

// Additional utility types
export interface QuizPerformanceMetrics {
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  lastAttemptDate: Date;
  improvementTrend: 'improving' | 'declining' | 'stable';
}

export interface QuizProgress {
  completedQuizzes: number;
  totalQuizzes: number;
  averageScore: number;
  weakTopics: string[];
  strongTopics: string[];
}

export interface QuizResultsListProps {
  userId?: string;
  courseId?: string;
  lessonId?: string;
}


export interface QuizTakingProps {
  courseId: string;
  lessonId: string;
  contentId: string;
  quizId?: string;
  onComplete?: (score: number, results: QuizResult) => void;
}

