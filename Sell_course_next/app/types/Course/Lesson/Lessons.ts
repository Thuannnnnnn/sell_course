// API Response Types for Course Learning System

// Video API Response
export interface VideoResponse {
  videoId: string;
  title: string;
  url: string;
  description?: string;
  duration?: string;
  createdAt: string;
}

// Document API Response
export interface DocumentResponse {
  docsId: string;
  title: string;
  url: string;
  createdAt: string;
  contentId?: string;
  contentName?: string;
  contentType?: string;
  fileType?: string;
  fileSize?: number;
  description?: string;
}

// Quiz API Response
export interface QuizResponse {
  quizId: string;
  title: string;
  questions: QuizQuestion[];
  totalQuestions: number;
  timeLimit?: number;
  createdAt: string;
}

export interface QuizQuestion {
  questionId: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

// Content API Response
export interface ContentResponse {
  contentId: string;
  contentName: string;
  contentType: string;
  url?: string;
  description?: string;
  createdAt: string;
}

// Lesson API Response
export interface LessonResponse {
  lessonId: string;
  lessonName: string;
  description?: string;
  duration?: string;
  order?: number;
  contents: ContentResponse[];
  createdAt: string;
}

// Course API Response
export interface CourseResponse {
  courseId: string;
  title: string;
  description?: string;
  instructorName?: string;
  price?: number;
  thumbnail?: string;
  createdAt: string;
}

// Exam API Response
export interface ExamResponse {
  examId: number;
  title: string;
  questions: ExamQuestion[];
  totalQuestions: number;
  timeLimit: number;
  passingScore: number;
  createdAt: string;
}

export interface ExamQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

// API Error Response
export interface ApiErrorResponse {
  message: string;
  statusCode: number;
  error: string;
}

// Frontend Types
export interface ContentData {
  type: 'video' | 'doc' | 'quiz' | 'text';
  data: VideoResponse | DocumentResponse | QuizResponse | { text: string };
}

export interface LessonWithContent {
  id: string;
  title: string;
  type: 'video' | 'text' | 'quiz';
  duration: string;
  isCompleted: boolean;
  content: VideoResponse | DocumentResponse | QuizResponse | { text: string };
  contents: ContentResponse[];
}

export interface CourseData {
  id: string;
  title: string;
  instructor: string;
  progress: number;
  modules: Array<{
    id: string;
    title: string;
    lessons: LessonWithContent[];
  }>;
  exams: Array<{
    id: number;
    title: string;
    questions: number;
    duration: string;
    isLocked: boolean;
  }>;
}
