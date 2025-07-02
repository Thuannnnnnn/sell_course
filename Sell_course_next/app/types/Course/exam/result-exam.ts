// Result Exam Types
export interface AnswerSubmitDto {
  questionId: string;
  answerId: string;
}

export interface SubmitExamDto {
  examId: string;
  courseId: string;
  answers: AnswerSubmitDto[];
}

export interface ExamAnswerResult {
  questionId: string;
  answerId: string;
  isCorrect: boolean;
}

export interface ResultExam {
  resultExamId: string;
  email: string;
  score: number;
  answers: ExamAnswerResult[];
  createdAt: string;
  exam: {
    examId: string;
    courseId: string;
    createdAt: string;
  };
  user: {
    userId: string;
    email: string;
    fullName: string;
    avatar?: string;
  };
}

export interface ExamAnswer {
  answerId: string;
  answer: string;
  isCorrect: boolean;
  createdAt: string;
}

export interface ExamQuestion {
  questionId: string;
  examId: string;
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  weight: number;
  answers: ExamAnswer[];
  createdAt: string;
}

export interface UserExamResult {
  resultExamId: string;
  email: string;
  score: number;
  answers: ExamAnswerResult[];
  createdAt: string;
  exam: {
    examId: string;
    courseId: string;
    createdAt: string;
  };
  user: {
    userId: string;
    email: string;
    fullName: string;
    avatar?: string;
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface SubmitExamResponse extends ApiResponse<ResultExam> {
  data: ResultExam;
}

export interface GetExamResultResponse extends ApiResponse<UserExamResult> {
  data: UserExamResult;
}

export interface GetAllResultsResponse extends ApiResponse<UserExamResult[]> {
  data: UserExamResult[];
}

export interface GetQuestionsResponse extends ApiResponse<ExamQuestion[]> {
  data: ExamQuestion[];
}

export interface GetAllExamResultsResponse extends ApiResponse<ResultExam[]> {
  data: ResultExam[];
}