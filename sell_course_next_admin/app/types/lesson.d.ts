import { Course } from "./course";

export interface Lesson {
  lessonId: string;
  lessonName: string;
  order: number;
  courseId: string;
  createdAt: Date;
  updatedAt: Date;
  contents?: Content[];
  course?: Course | null;
}

export interface Content {
  contentId: string;
  contentName: string;
  contentType: string;
  order: number;
  lessonId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLessonRequest {
  lessonName: string;
  courseId: string;
  order?: number;
}

export interface UpdateLessonRequest {
  lessonName?: string;
  order?: number;
}

export interface UpdateLessonOrderRequest {
  lessons: {
    lessonId: string;
    order: number;
  }[];
}

export interface CreateContentRequest {
  lessonId: string;
  contentName: string;
  contentType: string;
}

export interface UpdateContentRequest {
  contentName: string;
  contentType: string;
}

export interface UpdateContentOrderRequest {
  contents: {
    contentId: string;
    order: number;
  }[];
}