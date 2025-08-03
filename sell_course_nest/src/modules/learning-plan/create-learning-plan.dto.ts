import { IsString, IsOptional, IsArray, IsObject } from 'class-validator';

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

export interface LearningPathCourse {
  courseId: string;
  title: string;
  narrativeText: Array<{
    template: string;
    bindings: Record<string, any>;
  }>;
  lessons: Array<{
    lessonId: string;
    title: string;
    narrativeText: Array<{
      template: string;
      bindings: Record<string, any>;
    }>;
    contents: Array<{
      contentId: string;
      type: string;
      title: string;
      durationMin: number;
      narrativeText: Array<{
        template: string;
        bindings: Record<string, any>;
      }>;
    }>;
  }>;
}

export class CreateLearningPlanDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsObject()
  targetLearningPath?: TargetLearningPath;

  @IsOptional()
  @IsArray()
  learningPathCourses?: LearningPathCourse[];

  @IsOptional()
  @IsString()
  courseId?: string; // For backward compatibility

  @IsOptional()
  @IsArray()
  constraints?: Array<{
    constraintType: string;
    constraintValue: string;
  }>;

  @IsOptional()
  @IsArray()
  preferences?: Array<{
    preferenceType: string;
    preferenceValue: string;
  }>;
}

export class UpdateLearningPlanDto {
  @IsOptional()
  @IsObject()
  targetLearningPath?: TargetLearningPath;

  @IsOptional()
  @IsArray()
  learningPathCourses?: LearningPathCourse[];

  @IsOptional()
  @IsArray()
  constraints?: Array<{
    constraintType: string;
    constraintValue: string;
  }>;

  @IsOptional()
  @IsArray()
  preferences?: Array<{
    preferenceType: string;
    preferenceValue: string;
  }>;
}

// DTO for receiving n8n processed data
interface NarrativeItem {
  template: string;
  bindings: Record<string, unknown>;
}

interface ContentItem {
  contentId: string;
  type: string;
  title: string;
  durationMin: number;
  narrativeText: NarrativeItem[];
}

interface LessonItem {
  lessonId: string;
  title: string;
  narrativeText: NarrativeItem[];
  contents: ContentItem[];
}

interface CourseItem {
  order: number;
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

// New DTO for n8n data
export interface N8nLearningPathDto {
  userId: string;
  learningPath: [
    { learningPathCourses: CourseItem[] },
    { targetLearningPath: TargetLearningPath },
  ];
}

export interface N8nLearningPathDtOut {
  learningPath: N8nLearningPathDto[];
}
