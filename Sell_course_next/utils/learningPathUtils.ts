import {
  LearningPlanData,
  LearningPathProgress,
  ContentProgress,
  CompletionCheckResult,
  CourseItem,
  LessonItem,
  ContentItem,
} from "@/app/types/learningPath/learningPath";
import { createLearningPathAPI } from "@/app/api/learningPath/learningPathAPI";

/**
 * Trích xuất tất cả content IDs từ learning plan
 */
export const extractAllContentIds = (plan: LearningPlanData): string[] => {
  const contentIds: string[] = [];
  plan.learningPathCourses.forEach((course: CourseItem) => {
    course.lessons.forEach((lesson: LessonItem) => {
      lesson.contents.forEach((content: ContentItem) => {
        contentIds.push(content.contentId);
      });
    });
  });
  return contentIds;
};

/**
 * Tính toán tổng thời lượng của learning plan
 */
export const calculateTotalDuration = (plan: LearningPlanData): number => {
  return plan.learningPathCourses.reduce(
    (total: number, course: CourseItem) => {
      return (
        total +
        course.lessons.reduce((lessonTotal: number, lesson: LessonItem) => {
          return (
            lessonTotal +
            lesson.contents.reduce(
              (contentTotal: number, content: ContentItem) => {
                return contentTotal + content.durationMin;
              },
              0
            )
          );
        }, 0)
      );
    },
    0
  );
};

/**
 * Format thời lượng từ phút sang giờ:phút
 */
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${remainingMinutes}m`;
};

/**
 * Tính toán progress của một course cụ thể
 */
export const calculateCourseProgress = (
  course: CourseItem,
  contentProgress: Record<string, ContentProgress>
): number => {
  const courseContentIds: string[] = [];
  course.lessons.forEach((lesson: LessonItem) => {
    lesson.contents.forEach((content: ContentItem) => {
      courseContentIds.push(content.contentId);
    });
  });

  if (courseContentIds.length === 0) return 0;

  const completedCount = courseContentIds.filter(
    (id: string) => contentProgress[id]?.status === "completed"
  ).length;

  return Math.round((completedCount / courseContentIds.length) * 100);
};

/**
 * Tính toán progress của một lesson cụ thể
 */
export const calculateLessonProgress = (
  lesson: LessonItem,
  contentProgress: Record<string, ContentProgress>
): number => {
  const lessonContentIds: string[] = lesson.contents.map(
    (content: ContentItem) => content.contentId
  );

  if (lessonContentIds.length === 0) return 0;

  const completedCount = lessonContentIds.filter(
    (id: string) => contentProgress[id]?.status === "completed"
  ).length;

  return Math.round((completedCount / lessonContentIds.length) * 100);
};

/**
 * Lấy status của course
 */
export const getCourseStatus = (
  course: CourseItem,
  contentProgress: Record<string, ContentProgress>
): "not_started" | "in_progress" | "completed" => {
  const courseContentIds: string[] = [];
  course.lessons.forEach((lesson: LessonItem) => {
    lesson.contents.forEach((content: ContentItem) => {
      courseContentIds.push(content.contentId);
    });
  });

  const completedCount = courseContentIds.filter(
    (id: string) => contentProgress[id]?.status === "completed"
  ).length;
  const inProgressCount = courseContentIds.filter(
    (id: string) => contentProgress[id]?.status === "in_progress"
  ).length;

  if (completedCount === courseContentIds.length) return "completed";
  if (completedCount > 0 || inProgressCount > 0) return "in_progress";
  return "not_started";
};

/**
 * Lấy status của lesson
 */
export const getLessonStatus = (
  lesson: LessonItem,
  contentProgress: Record<string, ContentProgress>
): "not_started" | "in_progress" | "completed" => {
  const lessonContentIds: string[] = lesson.contents.map(
    (content: ContentItem) => content.contentId
  );

  const completedCount = lessonContentIds.filter(
    (id: string) => contentProgress[id]?.status === "completed"
  ).length;
  const inProgressCount = lessonContentIds.filter(
    (id: string) => contentProgress[id]?.status === "in_progress"
  ).length;

  if (completedCount === lessonContentIds.length) return "completed";
  if (completedCount > 0 || inProgressCount > 0) return "in_progress";
  return "not_started";
};

/**
 * Lấy status của content
 */
export const getContentStatus = (
  content: ContentItem,
  contentProgress: Record<string, ContentProgress>
): "not_started" | "in_progress" | "completed" => {
  const progress = contentProgress[content.contentId];
  return progress?.status || "not_started";
};

/**
 * Kiểm tra điều kiện tạo learning path mới
 * Trả về true nếu:
 * 1. Chưa có learning path nào (cho phép tạo path đầu tiên)
 * 2. Có ít nhất 1 learning path hoàn thành 100%
 */
export const checkCanCreateNewLearningPath = async (
  learningPlans: LearningPlanData[],
  userId: string,
  token: string
): Promise<CompletionCheckResult> => {
  // Nếu chưa có learning path nào, cho phép tạo
  if (!learningPlans || learningPlans.length === 0) {
    return {
      canCreateNew: true,
      completedPaths: [],
      incompletePaths: [],
      overallProgress: 0,
    };
  }

  const api = createLearningPathAPI(token);
  const completedPaths: string[] = [];
  const incompletePaths: string[] = [];
  let totalProgress = 0;

  try {
    // Kiểm tra progress của từng learning path
    for (const plan of learningPlans) {
      const allContentIds = extractAllContentIds(plan);

      try {
        const pathProgress = await api.getLearningPathProgress(
          userId,
          allContentIds
        );
        totalProgress += pathProgress.overallProgressPercentage;

        if (pathProgress.overallProgressPercentage >= 100) {
          completedPaths.push(plan.planId);
        } else {
          incompletePaths.push(plan.planId);
        }
      } catch (error) {
        console.error(
          `Failed to check progress for plan ${plan.planId}:`,
          error
        );
        incompletePaths.push(plan.planId);
      }
    }

    const averageProgress =
      learningPlans.length > 0 ? totalProgress / learningPlans.length : 0;
    const canCreateNew = completedPaths.length > 0;

    return {
      canCreateNew,
      completedPaths,
      incompletePaths,
      overallProgress: averageProgress,
    };
  } catch (error) {
    console.error("Failed to check learning path completion:", error);
    return {
      canCreateNew: false,
      completedPaths: [],
      incompletePaths: learningPlans.map((p: LearningPlanData) => p.planId),
      overallProgress: 0,
    };
  }
};

/**
 * Lấy màu sắc cho progress bar dựa trên phần trăm
 */
export const getProgressColor = (percentage: number): string => {
  if (percentage >= 100) return "bg-green-500";
  if (percentage >= 75) return "bg-blue-500";
  if (percentage >= 50) return "bg-yellow-500";
  if (percentage >= 25) return "bg-orange-500";
  return "bg-gray-400";
};

/**
 * Lấy màu sắc cho text dựa trên progress
 */
export const getProgressTextColor = (
  progress: LearningPathProgress | null
): string => {
  if (!progress) return "text-gray-500";

  if (progress.overallProgressPercentage >= 100) return "text-green-600";
  if (progress.overallProgressPercentage >= 50) return "text-blue-600";
  if (progress.overallProgressPercentage > 0) return "text-yellow-600";
  return "text-gray-500";
};

/**
 * Lấy màu sắc cho status
 */
export const getStatusColor = (
  status: "not_started" | "in_progress" | "completed"
): string => {
  switch (status) {
    case "completed":
      return "border-green-200 bg-green-50";
    case "in_progress":
      return "border-blue-200 bg-blue-50";
    default:
      return "border-gray-200 bg-white";
  }
};
