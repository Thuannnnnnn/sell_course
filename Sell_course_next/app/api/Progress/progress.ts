import {
  CompletedCountResponse,
  CompletedLessonsCount,
  ContentProgressStatus,
  CourseProgressResponse,
  LessonProgressResponseDto,
} from "@/app/types/Progress/progress";
import axios from "axios";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/progress`;

export const markContentAsCompleted = async (
  userId: string,
  contentId: string,
  lessonId: string,
  token: string
) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/complete`,
      {
        userId,
        contentId,
        lessonId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to mark content as completed"
      );
    }
    throw new Error("Unexpected error while marking content as completed");
  }
};

export const getLessonProgress = async (
  lessonId: string,
  userId: string,
  token: string
): Promise<LessonProgressResponseDto> => {
  const response = await axios.get(
    `${API_BASE_URL}/lesson/${lessonId}/user/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const getCompletedContentsCount = async (
  lessonId: string,
  userId: string,
  token: string
): Promise<CompletedCountResponse> => {
  const response = await axios.get(
    `${API_BASE_URL}/lesson/${lessonId}/user/${userId}/completed-contents-count`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const getCourseProgress = async (
  courseId: string,
  userId: string,
  token: string
): Promise<CourseProgressResponse> => {
  const response = await axios.get(
    `${API_BASE_URL}/course/${courseId}/user/${userId}/progress`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const getContentStatus = async (
  contentId: string,
  userId: string,
  token: string
): Promise<ContentProgressStatus> => {
  const response = await axios.get(
    `${API_BASE_URL}/content/${contentId}/user/${userId}/status`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const getCompletedLessonsCountInCourse = async (
  courseId: string,
  userId: string,
  token: string
): Promise<CompletedLessonsCount> => {
  const response = await axios.get(
    `${API_BASE_URL}/course/${courseId}/user/${userId}/completed-lessons-count`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};
