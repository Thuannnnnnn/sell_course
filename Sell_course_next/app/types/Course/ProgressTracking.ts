export interface ProgressTracking {
  userId: string;
  contentId: string;
  lessonId: string;
  isCompleted: boolean;
  completedAt?: string;
}