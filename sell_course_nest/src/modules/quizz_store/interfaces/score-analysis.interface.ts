export interface AnswerResult {
  questionId: string;
  answerId: string | null;
  isCorrect: boolean;
  timeSpent?: number;
}

export interface ScoreResult {
  rawScore: number;
  totalPossible: number;
  percentage: number;
  breakdown: ScoreBreakdown;
}

export interface ScoreBreakdown {
  byDifficulty: {
    easy: DifficultyStats;
    medium: DifficultyStats;
    hard: DifficultyStats;
  };
  byTopic: { [topic: string]: TopicStats };
}

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
