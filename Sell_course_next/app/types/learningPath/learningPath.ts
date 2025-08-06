export interface NarrativeItem {
  template: string;
  bindings: Record<string, string | number | boolean>;
}

export interface ContentItem {
  contentId: string;
  type: string;
  title: string;
  durationMin: number;
  narrativeText: NarrativeItem[];
}

export interface LessonItem {
  lessonId: string;
  title: string;
  narrativeText: NarrativeItem[];
  contents: ContentItem[];
}

export interface CourseItem {
  courseId: string;
  title: string;
  order?: number;
  narrativeText: NarrativeItem[];
  lessons: LessonItem[];
}

export interface TargetLearningPath {
  topic: string;
  learning_goal: string;
  target_level: string;
  current_level: string;
  has_prior_knowledge: boolean;
  desired_duration: string;
  preferred_learning_styles: string[];
  learning_order: string;
  output_expectations: {
    want_progress_tracking: boolean;
    want_mentor_or_AI_assist: boolean;
    post_learning_outcome: string;
  };
  userId: string;
  userName: string;
}

export interface LearningPlanData {
  planId: string;
  userId: string;
  courseId: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  targetLearningPath: TargetLearningPath;
  learningPathCourses: CourseItem[];
}

export interface ContentProgress {
  contentId: string;
  status: "not_started" | "in_progress" | "completed";
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

export interface RawQuestionOption {
  text: string;
  value: string;
}

export interface RawQuestion {
  id: string;
  questionText: string;
  type: "single" | "multiple" | "text" | "date";
  required: boolean;
  options?: RawQuestionOption[];
}

export interface LearningPathInput {
  topic: string;
  learning_goal: string;
  target_level: string;
  current_level: string;
  has_prior_knowledge: boolean;
  preferred_learning_styles: string[];
  learning_order: string;
  output_expectations: {
    want_progress_tracking: boolean;
    want_mentor_or_AI_assist: boolean;
    post_learning_outcome: string[];
  };
  userId: string;
  userName: string;
}

export interface LearningPlanSummary {
  planId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  targetLearningPath: {
    topic: string;
    learning_goal: string;
    target_level: string;
    current_level: string;
    desired_duration: string;
    userName: string;
  };
  learningPathCourses: Array<{
    courseId: string;
    title: string;
    order?: number;
    lessons: Array<{
      lessonId: string;
      title: string;
      contents: Array<{
        contentId: string;
        durationMin: number;
      }>;
    }>;
  }>;
}

// Roadmap specific interfaces
export interface RoadmapNodeData {
  id: string;
  title: string;
  type: "target" | "course";
  status: "not_started" | "in_progress" | "completed";
  progress: number;
  order?: number;
  courseData?: CourseItem;
  targetData?: TargetLearningPath;
}

// Completion check interfaces
export interface CompletionCheckResult {
  canCreateNew: boolean;
  completedPaths: string[];
  incompletePaths: string[];
  overallProgress: number;
}

// Progress tracking interfaces (matching backend)
export interface ProgressTrackingEntity {
  progress_id: string;
  user: {
    user_id: string;
  };
  content: {
    contentId: string;
  };
  lesson: {
    lessonId: string;
  };
  is_completed: boolean;
  completed_at: Date | null;
}

export interface MarkProgressDto {
  userId: string;
  contentId: string;
  lessonId: string;
}

export interface LessonProgressResponseDto {
  lessonId: string;
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

export interface ContentProgressStatus {
  contentId: string;
  userId: string;
  isCompleted: boolean;
}

export interface CompletedLessonsCount {
  courseId: string;
  userId: string;
  completedLessonsCount: number;
}

// Bulk progress interfaces for new API
export interface BulkProgressRequest {
  contentIds: string[];
}

export interface BulkProgressResponse {
  [contentId: string]: {
    contentId: string;
    isCompleted: boolean;
    completedAt?: string;
  };
}

// API Response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Learning path with progress data
export interface LearningPlanWithProgress {
  plan: LearningPlanData;
  progress: LearningPathProgress | null;
  contentProgress: Record<string, ContentProgress>;
  canCreateNew: boolean;
}

// Course with progress data
export interface CourseWithProgress {
  course: CourseItem;
  progress: number;
  status: "not_started" | "in_progress" | "completed";
  contentProgress: Record<string, ContentProgress>;
}

// Lesson with progress data
export interface LessonWithProgress {
  lesson: LessonItem;
  progress: number;
  status: "not_started" | "in_progress" | "completed";
  contentProgress: Record<string, ContentProgress>;
}

// Content with progress data
export interface ContentWithProgress {
  content: ContentItem;
  progress: ContentProgress | null;
  status: "not_started" | "in_progress" | "completed";
}
