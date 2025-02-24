// quizz.d.ts

// Interface for an Answer
export interface Answer {
  answerId: string;
  answer: string;
  isCorrect: boolean;
}

// Interface for a Question
export interface Question {
  questionId: string;
  question: string;
  answers: Answer[];
}

// Interface for a Quiz
export interface Quiz {
  quizzId: string;
  contentId: string;
  questions: Question[];
}
interface QuizAnswer {
  questionId: string;
  answerId: string;
}
export interface QuizSubmissionData {
  userId: string;
  answers: QuizAnswer[];
  quizzId?: string;
}

// Interface for creating a new quiz
export interface CreateQuizzDto {
  contentId: string;
  questions: {
    question: string;
    answers: {
      answer: string;
      isCorrect: boolean;
    }[];
  }[];
}

// Interface for updating an existing quiz
export interface UpdateQuizzDto {
  quizzId: string;
  questions: {
    questionId: string;
    question: string;
    answers: {
      answerId: string;
      answer: string;
      isCorrect: boolean;
    }[];
  }[];
}
