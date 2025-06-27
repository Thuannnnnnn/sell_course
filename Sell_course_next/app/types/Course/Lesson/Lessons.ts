import { Course } from "../Course";

export interface LessonsResponse {
  courseId: string;
  courseName: string;
  lessons: Lesson[];
}

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
