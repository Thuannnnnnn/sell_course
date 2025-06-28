export interface ExamAnswer {
  answerId: string;
  answer: string;
  isCorrect: boolean;
}

export interface ExamQuestion {
  questionId: string;
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  weight: number;
  answers: ExamAnswer[];
}

export interface Exam {
  examId: string;
  courseId: string;
  questions: ExamQuestion[];
  createdAt?: Date;
  updatedAt?: Date;
}

// DTOs for API requests
export interface CreateExamAnswerDto {
  answer: string;
  isCorrect: boolean;
}

export interface CreateExamQuestionDto {
  question: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  weight?: number;
  answers: CreateExamAnswerDto[];
}

export interface CreateExamDto {
  courseId: string;
  questions: CreateExamQuestionDto[];
}

export interface UpdateExamQuestionDto {
  question: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  weight?: number;
  answers: UpdateExamAnswerDto[];
}

export interface UpdateExamAnswerDto {
  answerId?: string;
  answer: string;
  isCorrect: boolean;
}

// DTO for creating exam from quizzes
export interface CreateExamFromQuizzesDto {
  courseId: string;
  questionsPerQuiz?: number;
  totalQuestions?: number;
  includeAllQuizzes?: boolean;
  specificQuizIds?: string[];
}

// Available quiz info for exam creation
export interface AvailableQuiz {
  quizzId: string;
  courseId: string;
  lessonId: string;
  contentId: string;
  questionCount: number;
}

// For frontend exam management
export interface ExamFormData {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  weight?: number;
}

// Exam creation configuration
export interface ExamCreationConfig {
  questionsPerQuiz?: number;
  totalQuestions?: number;
  includeAllQuizzes?: boolean;
  specificQuizIds?: string[];
}