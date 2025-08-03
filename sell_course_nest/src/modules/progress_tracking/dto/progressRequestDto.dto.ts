export class MarkProgressDto {
  userId: string;
  contentId: string;
  lessonId: string;
}

export interface BulkProgressRequest {
  contentIds: string[];
}

export interface UpdateContentStatusRequest {
  status: 'not_started' | 'in_progress' | 'completed';
  progressPercentage?: number;
  timeSpentMinutes?: number;
}

export interface ContentProgress {
  contentId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progressPercentage: number;
  timeSpentMinutes: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface LearningPathProgress {
  totalContents: number;
  completedContents: number;
  inProgressContents: number;
  notStartedContents: number;
  overallProgressPercentage: number;
  totalTimeSpent: number;
}
