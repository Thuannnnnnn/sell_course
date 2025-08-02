const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function apiCall<T>(
  endpoint: string,
  token: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log("🌐 Making API call to:", url);

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`No Lesson In Course`);
  }

  return response.json();
}

// Course API
export const courseApi = {
  getCourseById: async (courseId: string, token: string) => {
    return apiCall(`/api/courses/getByCourse/${courseId}`, token);
  },

  getLessonsByCourseId: async (courseId: string, token: string) => {
    return apiCall(`/api/lesson/view_lesson/${courseId}`, token);
  },

  getContentsByLessonId: async (
    courseId: string,
    lessonId: string,
    token: string
  ) => {
    return apiCall(
      `/api/courses/${courseId}/lessons/${lessonId}/contents`,
      token
    );
  },
};

// Content API
export const contentApi = {
  getVideoContent: async (contentId: string, token: string) => {
    return apiCall(`/api/video/view_video_content/${contentId}`, token);
  },

  getDocumentContent: async (contentId: string, token: string) => {
    return apiCall(`/api/docs/view_doc/${contentId}`, token);
  },

  getQuizContent: async (
    courseId: string,
    lessonId: string,
    contentId: string,
    token: string
  ) => {
    return apiCall(
      `/api/courses/${courseId}/lessons/${lessonId}/contents/${contentId}/quizzes/random`,
      token
    );
  },
};

// Exam API
export const examApi = {
  getExamQuestions: async (examId: number, token: string) => {
    return apiCall(`/api/exam/${examId}/questions`, token);
  },

  submitExamAnswer: async (
    examId: number,
    questionId: string,
    answer: string,
    token: string
  ) => {
    return apiCall(`/api/exam/${examId}/submit`, token, {
      method: "POST",
      body: JSON.stringify({ questionId, answer }),
    });
  },
};

export { apiCall };
