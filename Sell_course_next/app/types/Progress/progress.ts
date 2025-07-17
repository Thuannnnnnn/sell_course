
export interface LessonProgressResponseDto {
  lessonId: string;
  userId: string;
  isCompleted: boolean;
}

export interface ContentProgressStatus {
  contentId: string;
  userId: string;
  isCompleted: boolean;
}

export interface CompletedCountResponse {
  lessonId: string;
  userId: string;
  completedContentsCount: number;
}

export interface CourseProgressResponse {
  progress: number;
}

export interface CompletedLessonsCount {
  courseId: string;
  userId: string;
  completedLessonsCount: number;
}

