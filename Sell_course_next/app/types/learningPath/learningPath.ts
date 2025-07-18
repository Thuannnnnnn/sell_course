export interface AvailableSlot {
  day_of_week: number; // 0 (Chủ nhật) - 6 (Thứ 7)
  start_time: string; // HH:mm
  duration: number; // in minutes
}

export interface LearningPathInput {
  userId: string;
  name: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  study_goal: string;
  study_hours_per_week: number;
  total_weeks: number;
  max_minutes_per_day: number;
  no_study_days: number[];
  experience: string;
  available_slots: AvailableSlot[];
  course_ids: string;
  start_date: string; // YYYY-MM-DD
}

export interface LearningPathSurveyAnswers {
  name: string;
  difficulty_preference: "beginner" | "intermediate" | "advanced";
  learning_goal: string;
  time_availability:
    | "Dưới 30 phút"
    | "30-60 phút"
    | "1-2 giờ"
    | "2-3 giờ"
    | "Trên 3 giờ";
  preferred_days: string[]; // e.g., ["Thứ 2", "Thứ 4", "Thứ 6"]
  preferred_time:
    | "Sáng sớm (6:00-9:00)"
    | "Buổi sáng (9:00-12:00)"
    | "Buổi chiều (12:00-17:00)"
    | "Buổi tối (17:00-21:00)"
    | "Tối muộn (21:00-24:00)";
  special_requirements: string; // experience
  timestamp: string;
  // Fields that will be directly mapped from the new input structure
  userId?: string;
  total_weeks?: number;
  start_date?: string;
}

export interface ScheduleItem {
  dayOfWeek: number;
  startTime: string;
  durationMin: number;
  courseId: string;
  contentIds: string[];
  weekNumber: number;
  scheduledDate: string;
}

export interface NarrativeItem {
  template: string;
  bindings: {
    weekNumber?: number;
    dayOfWeek?: string;
    startTime?: string;
    endTime?: string;
    contentId?: string;
    contentTitle?: string;
    contentTitles?: string;
    overview?: string;
    questions?: string;
    summary?: string;
  };
}

export interface LearningPathData {
  scheduleItems: {
    scheduleData: ScheduleItem[];
    narrativeText: NarrativeItem[];
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
