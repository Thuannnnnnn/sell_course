// ===== COMMON TYPES =====
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ===== AVAILABLE SLOT TYPES =====
export interface AvailableSlot {
  day_of_week: number; // 0 (Chủ nhật) - 6 (Thứ 7)
  start_time: string; // HH:mm
  duration: number; // in minutes
}

// ===== LEARNING PATH INPUT TYPES =====
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

// ===== SURVEY TYPES =====
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

// ===== SCHEDULE ITEM TYPES =====
export interface ScheduleItem {
  dayOfWeek: number;
  startTime: string;
  durationMin: number;
  courseId: string;
  contentIds: string[];
  weekNumber: number;
  scheduledDate: string;
}

// ===== NARRATIVE TYPES =====
export interface NarrativeBindings {
  weekNumber?: number;
  dayOfWeek?: string;
  startTime?: string;
  endTime?: string;
  scheduledDate?: string;
  contentId?: string;
  contentTitle?: string;
  contentTitles?: string;
  overview?: string;
  questions?: string;
  summary?: string;
}

export interface NarrativeItem {
  template: string;
  bindings: NarrativeBindings;
}

// ===== LEARNING PATH DATA TYPES =====
export interface LearningPathData {
  scheduleItems: {
    scheduleData: ScheduleItem[];
    narrativeText: NarrativeItem[];
  };
}

// ===== QUESTION TYPES =====
export interface QuestionOption {
  optionId: string;
  text: string;
}

export interface RawQuestion {
  id: string;
  questionText: string;
  type: "single" | "multiple" | "text" | "date";
  required: boolean;
  options: QuestionOption[];
}

export interface Question {
  id: string;
  question: string;
  type: "single" | "multiple" | "text";
  options?: string[];
  required?: boolean;
}

// ===== BACKEND DTO TYPES =====
export interface PlanConstraint {
  type: string;
  key: string;
  value: string;
}

export interface PlanPreference {
  type: string;
  key: string;
  value: string;
  weight: number;
}

export interface CreateLearningPlanRequest {
  userId: string;
  courseId: string;
  studyGoal: string;
  totalWeeks: number;
  constraints: PlanConstraint[];
  preferences: PlanPreference[];
  narrativeTemplates?: NarrativeItem[];
  scheduleItems?: ScheduleItem[];
}

export interface UpdateLearningPlanRequest {
  studyGoal?: string;
  totalWeeks?: number;
  constraints?: PlanConstraint[];
  preferences?: PlanPreference[];
  narrativeTemplates?: NarrativeItem[];
  scheduleItems?: ScheduleItem[];
}

// ===== BACKEND RESPONSE TYPES =====
export interface LearningPlan {
  planId: string;
  userId: string;
  courseId: string;
  studyGoal: string;
  totalWeeks: number;
  createdAt: string;
  updatedAt?: string;
  scheduleItems: {
    scheduleData: ScheduleItem[];
    narrativeText: NarrativeItem[];
  };
  constraints: PlanConstraint[];
  preferences: PlanPreference[];
}

export interface DeleteResult {
  affected?: number;
  raw?: unknown;
}

// ===== N8N PAYLOAD TYPES =====
export interface N8nPayload {
  userId: string;
  name: string;
  level: string;
  study_goal: string;
  study_hours_per_week: number;
  total_weeks: number;
  max_minutes_per_day: number;
  no_study_days: number[];
  experience: string;
  available_slots: AvailableSlot[];
  course_ids: string;
  start_date: string;
}

export interface N8nResponse {
  scheduleItems?: {
    scheduleData: ScheduleItem[];
    narrativeText: NarrativeItem[];
  };
  schedule?: ScheduleItem[];
  narrative?: NarrativeItem[];
  scheduleData?: ScheduleItem[];
  narrativeText?: NarrativeItem[];
}

// ===== ENUMS =====
export enum ConstraintType {
  TIME_AVAILABILITY = "time_availability",
  STUDY_HOURS = "study_hours",
  AVAILABLE_SLOTS = "available_slots",
  NO_STUDY_DAYS = "no_study_days",
}

export enum PreferenceType {
  DIFFICULTY_LEVEL = "difficulty_level",
  EXPERIENCE = "experience",
}

export enum DayOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

export enum LearningLevel {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
  EXPERT = "expert",
}

// ===== TYPE GUARDS =====
export function isApiResponse<T>(obj: unknown): obj is ApiResponse<T> {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "success" in obj &&
    typeof (obj as ApiResponse<T>).success === "boolean"
  );
}

export function isLearningPlan(obj: unknown): obj is LearningPlan {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "planId" in obj &&
    "userId" in obj &&
    "courseId" in obj &&
    "studyGoal" in obj &&
    "totalWeeks" in obj
  );
}

export function isScheduleItem(obj: unknown): obj is ScheduleItem {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "dayOfWeek" in obj &&
    "startTime" in obj &&
    "durationMin" in obj &&
    "courseId" in obj &&
    "contentIds" in obj &&
    "weekNumber" in obj &&
    "scheduledDate" in obj
  );
}

export function isNarrativeItem(obj: unknown): obj is NarrativeItem {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "template" in obj &&
    "bindings" in obj &&
    typeof (obj as NarrativeItem).template === "string"
  );
}

export function isLearningPathData(obj: unknown): obj is LearningPathData {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "scheduleItems" in obj &&
    typeof (obj as LearningPathData).scheduleItems === "object" &&
    "scheduleData" in (obj as LearningPathData).scheduleItems &&
    "narrativeText" in (obj as LearningPathData).scheduleItems
  );
}

// ===== VALIDATION HELPERS =====
export function validateLearningPathInput(
  input: Partial<LearningPathInput>
): string[] {
  const errors: string[] = [];

  if (!input.userId) errors.push("User ID is required");
  if (!input.name) errors.push("Name is required");
  if (!input.level) errors.push("Level is required");
  if (!input.study_goal) errors.push("Study goal is required");
  if (!input.study_hours_per_week || input.study_hours_per_week <= 0) {
    errors.push("Study hours per week must be greater than 0");
  }
  if (!input.total_weeks || input.total_weeks <= 0) {
    errors.push("Total weeks must be greater than 0");
  }
  if (!input.max_minutes_per_day || input.max_minutes_per_day <= 0) {
    errors.push("Max minutes per day must be greater than 0");
  }
  if (!input.course_ids) {
    errors.push("Course ID is required");
  }
  if (!input.start_date) errors.push("Start date is required");

  return errors;
}

export function validateCreateLearningPlanRequest(
  request: Partial<CreateLearningPlanRequest>
): string[] {
  const errors: string[] = [];

  if (!request.userId) errors.push("User ID is required");
  if (!request.courseId) errors.push("Course ID is required");
  if (!request.studyGoal) errors.push("Study goal is required");
  if (!request.totalWeeks || request.totalWeeks <= 0) {
    errors.push("Total weeks must be greater than 0");
  }
  if (!request.constraints) errors.push("Constraints are required");
  if (!request.preferences) errors.push("Preferences are required");

  return errors;
}

export function validateScheduleItem(item: Partial<ScheduleItem>): string[] {
  const errors: string[] = [];

  if (
    typeof item.dayOfWeek !== "number" ||
    item.dayOfWeek < 0 ||
    item.dayOfWeek > 6
  ) {
    errors.push("Day of week must be between 0 and 6");
  }
  if (
    !item.startTime ||
    !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(item.startTime)
  ) {
    errors.push("Start time must be in HH:mm format");
  }
  if (!item.durationMin || item.durationMin <= 0) {
    errors.push("Duration must be greater than 0");
  }
  if (!item.courseId) errors.push("Course ID is required");
  if (!item.contentIds || !Array.isArray(item.contentIds)) {
    errors.push("Content IDs must be an array");
  }
  if (typeof item.weekNumber !== "number" || item.weekNumber <= 0) {
    errors.push("Week number must be greater than 0");
  }
  if (!item.scheduledDate || !/^\d{4}-\d{2}-\d{2}$/.test(item.scheduledDate)) {
    errors.push("Scheduled date must be in YYYY-MM-DD format");
  }

  return errors;
}

// ===== TRANSFORMATION HELPERS =====
export function transformLearningPathInputToCreateRequest(
  input: LearningPathInput,
  courseId: string
): CreateLearningPlanRequest {
  const constraints: PlanConstraint[] = [];
  const preferences: PlanPreference[] = [];

  // Add constraints
  if (input.max_minutes_per_day) {
    constraints.push({
      type: ConstraintType.TIME_AVAILABILITY,
      key: "max_minutes_per_day",
      value: input.max_minutes_per_day.toString(),
    });
  }

  if (input.study_hours_per_week) {
    constraints.push({
      type: ConstraintType.STUDY_HOURS,
      key: "hours_per_week",
      value: input.study_hours_per_week.toString(),
    });
  }

  if (input.available_slots && input.available_slots.length > 0) {
    input.available_slots.forEach((slot, index) => {
      constraints.push({
        type: ConstraintType.AVAILABLE_SLOTS,
        key: `slot_${index}`,
        value: JSON.stringify(slot),
      });
    });
  }

  if (input.no_study_days && input.no_study_days.length > 0) {
    constraints.push({
      type: ConstraintType.NO_STUDY_DAYS,
      key: "days",
      value: JSON.stringify(input.no_study_days),
    });
  }

  // Add preferences
  if (input.level) {
    preferences.push({
      type: PreferenceType.DIFFICULTY_LEVEL,
      key: "level",
      value: input.level,
      weight: 1,
    });
  }

  if (input.experience) {
    preferences.push({
      type: PreferenceType.EXPERIENCE,
      key: "description",
      value: input.experience,
      weight: 1,
    });
  }

  return {
    userId: input.userId,
    courseId: courseId,
    studyGoal: input.study_goal,
    totalWeeks: input.total_weeks,
    constraints,
    preferences,
  };
}

export function transformLearningPlanToLearningPathData(
  plan: LearningPlan
): LearningPathData {
  return {
    scheduleItems: {
      scheduleData: plan.scheduleItems?.scheduleData || [],
      narrativeText: plan.scheduleItems?.narrativeText || [],
    },
  };
}

export function transformLearningPathDataToUpdateRequest(
  data: LearningPathData
): UpdateLearningPlanRequest {
  return {
    narrativeTemplates: data.scheduleItems.narrativeText,
    scheduleItems: data.scheduleItems.scheduleData,
  };
}

export function transformToN8nFormat(input: LearningPathInput): N8nPayload {
  return {
    userId: input.userId,
    name: input.name,
    level: input.level,
    study_goal: input.study_goal,
    study_hours_per_week: input.study_hours_per_week,
    total_weeks: input.total_weeks,
    max_minutes_per_day: input.max_minutes_per_day,
    no_study_days: input.no_study_days,
    experience: input.experience,
    available_slots: input.available_slots,
    course_ids: input.course_ids,
    start_date: input.start_date,
  };
}

export function transformFromN8nResponse(n8nData: unknown): LearningPathData {
  console.log("Transforming n8n response:", n8nData);

  // Handle array response format
  if (Array.isArray(n8nData) && n8nData.length > 0) {
    const firstItem = n8nData[0] as N8nResponse;

    if (firstItem && firstItem.scheduleItems) {
      return {
        scheduleItems: {
          scheduleData: firstItem.scheduleItems.scheduleData || [],
          narrativeText: firstItem.scheduleItems.narrativeText || [],
        },
      };
    }
  }

  // Handle object response format
  if (n8nData && typeof n8nData === "object" && !Array.isArray(n8nData)) {
    const response = n8nData as N8nResponse;

    // Check various possible structures
    if (response.scheduleItems) {
      return {
        scheduleItems: {
          scheduleData: response.scheduleItems.scheduleData || [],
          narrativeText: response.scheduleItems.narrativeText || [],
        },
      };
    } else if (response.schedule || response.narrative) {
      return {
        scheduleItems: {
          scheduleData: response.schedule || [],
          narrativeText: response.narrative || [],
        },
      };
    } else if (response.scheduleData || response.narrativeText) {
      return {
        scheduleItems: {
          scheduleData: response.scheduleData || [],
          narrativeText: response.narrativeText || [],
        },
      };
    }
  }

  // Default empty structure
  console.warn(
    "No valid data structure found in n8n response, returning empty structure"
  );
  return {
    scheduleItems: {
      scheduleData: [],
      narrativeText: [],
    },
  };
}

export function transformFromBackendResponse(
  backendData: unknown
): LearningPathData {
  if (!backendData || typeof backendData !== "object") {
    return {
      scheduleItems: {
        scheduleData: [],
        narrativeText: [],
      },
    };
  }

  const data = backendData as Record<string, unknown>;

  return {
    scheduleItems: {
      scheduleData: (data.scheduleItems as ScheduleItem[]) || [],
      narrativeText: (data.narrativeTemplates as NarrativeItem[]) || [],
    },
  };
}

// ===== UTILITY FUNCTIONS =====
export function calculateEndTime(
  startTime: string,
  durationMin: number
): string {
  const [hours, minutes] = startTime.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes + durationMin;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;

  return `${endHours.toString().padStart(2, "0")}:${endMinutes
    .toString()
    .padStart(2, "0")}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
}

export function getDayName(dayOfWeek: number): string {
  const dayNames = [
    "Chủ nhật",
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
  ];
  return dayNames[dayOfWeek] || "Không xác định";
}

