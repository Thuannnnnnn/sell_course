import { CourseStatus } from '../enums/course-status.enum';

export interface CourseContentResponse {
  contentId: string;
  contentName: string;
  contentType: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  video?: {
    videoId: string;
    title: string;
    description: string;
    url: string;
    urlScript: string;
    createdAt: Date;
  };
  doc?: {
    docsId: string;
    title: string;
    url: string;
    createdAt: Date;
  };
  quiz?: {
    quizzId: string;
    createdAt: Date;
    questions: {
      questionId: string;
      question: string;
      difficulty: string;
      weight: number;
      answers: {
        answerId: string;
        answer: string;
        isCorrect: boolean;
      }[];
    }[];
  };
}

export interface CourseLessonResponse {
  lessonId: string;
  lessonName: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  contents: CourseContentResponse[];
}

export interface CourseExamResponse {
  examId: string;
  createdAt: Date;
  questions: {
    questionId: string;
    question: string;
    difficulty: string;
    weight: number;
    answers: {
      answerId: string;
      answer: string;
      isCorrect: boolean;
    }[];
  }[];
}

export interface CourseDetailResponse {
  courseId: string;
  title: string;
  description: string;
  short_description: string;
  duration: number;
  price: number;
  videoIntro: string;
  thumbnail: string;
  rating: number;
  skill: string;
  level: string;
  status: CourseStatus;
  createdAt: Date;
  updatedAt: Date;
  instructor: {
    userId: string;
    username: string;
    email: string;
    avatarImg: string;
  };
  category: {
    categoryId: string;
    name: string;
  };
  lessons: CourseLessonResponse[];
  exam?: CourseExamResponse;
  totalLessons: number;
  totalContents: number;
}
