import axios from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}`;

const getAuthHeaders = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const markContentAsCompleted = async (
  userId: string,
  contentId: string,
  lessonId: string,
  token: string
): Promise<number> => {
  try {
    const response = await axios.post(
      `${API_URL}/progress/complete`,
      { userId, contentId, lessonId },
      getAuthHeaders(token)
    );
    return response.status;
  } catch (error) {
    handleAxiosError(error, "marking content as completed");
    throw error;
  }
};

export const fetchLessonProgress = async (
  lessonId: string,
  userId: string,
  token: string
): Promise<boolean> => {
  try {
    const response = await axios.get(
      `${API_URL}/progress/lesson/${lessonId}/user/${userId}`,
      getAuthHeaders(token)
    );
    return response.data.isCompleted;
  } catch (error) {
    handleAxiosError(error, "fetching lesson progress");
    throw error;
  }
};

export const fetchCompletedContentsCount = async (
  lessonId: string,
  userId: string,
  token: string
): Promise<number> => {
  try {
    const response = await axios.get(
      `${API_URL}/progress/lesson/${lessonId}/user/${userId}/completed-contents-count`,
      getAuthHeaders(token)
    );
    return response.data.completedContentsCount;
  } catch (error) {
    handleAxiosError(error, "fetching completed contents count");
    throw error;
  }
};

export const fetchCompletedLessonsCount = async (
  courseId: string,
  userId: string,
  token: string
): Promise<number> => {
  try {
    const response = await axios.get(
      `${API_URL}/progress/course/${courseId}/user/${userId}/completed-lessons-count`,
      getAuthHeaders(token)
    );
    return response.data.completedLessonsCount;
  } catch (error) {
    handleAxiosError(error, "fetching completed lessons count");
    throw error;
  }
};

export const fetchCourseProgress = async (
  courseId: string,
  userId: string,
  token: string
): Promise<number> => {
  try {
    const response = await axios.get(
      `${API_URL}/progress/course/${courseId}/user/${userId}/progress`,
      getAuthHeaders(token)
    );
    return response.data.progress;
  } catch (error) {
    handleAxiosError(error, "fetching course progress");
    throw error;
  }
};

export const fetchContentStatus = async (
  contentId: string,
  userId: string,
  token: string
): Promise<boolean> => {
  try {
    const response = await axios.get(
      `${API_URL}/progress/content/${contentId}/user/${userId}/status`,
      getAuthHeaders(token)
    );
    return response.data.isCompleted;
  } catch (error) {
    handleAxiosError(error, "fetching content completion status");
    throw error;
  }
};

const handleAxiosError = (error: unknown, context: string) => {
  if (axios.isAxiosError(error)) {
    console.error(
      `Axios error ${context}:`,
      error.response?.data || error.message
    );
  } else {
    console.error(`Unexpected error ${context}:`, error);
  }
};
