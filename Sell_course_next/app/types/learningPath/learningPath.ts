export interface NarrativeItem {
  template: string;
  bindings: Record<string, any>;
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
  createdAt: string;
  updatedAt: string;
  targetLearningPath: TargetLearningPath;
  learningPathCourses: CourseItem[];
  constraints: any[];
  preferences: any[];
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
