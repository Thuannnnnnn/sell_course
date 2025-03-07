
export interface Answer {
  answerId: string;
  answer: string;
  isCorrect: boolean;
}


export interface Question {
  questionId: string;
  question: string;
  answers: Answer[];
}


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
