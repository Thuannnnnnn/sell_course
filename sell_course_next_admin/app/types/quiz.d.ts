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
  tags?: string[];
  answers: Answer[];
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

// DTOs for API requests
export interface CreateAnswerDto {
  answer: string;
  isCorrect: boolean;
}

export interface CreateQuestionDto {
  question: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  weight?: number;
  tags?: string[];
  answers: CreateAnswerDto[];
}

export interface CreateQuizDto {
  contentId: string;
  questions: CreateQuestionDto[];
}

export interface UpdateQuizDto {
  questions?: CreateQuestionDto[];
}

// For frontend quiz management
export interface QuizFormData {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  weight?: number;
  tags?: string[];
}