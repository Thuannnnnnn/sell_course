const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log('🌐 Making API call to:', url);

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

// Course API
export const courseApi = {
  getCourseById: async (courseId: string) => {
    return apiCall(`/api/courses/getByCourse/${courseId}`);
  },
  
  getLessonsByCourseId: async (courseId: string) => {
    return apiCall(`/api/lesson/view_lesson/${courseId}`);
  },
  
  getContentsByLessonId: async (courseId: string, lessonId: string) => {
    return apiCall(`/api/courses/${courseId}/lessons/${lessonId}/contents`);
  },
};

// Content API
export const contentApi = {
  getVideoContent: async (contentId: string) => {
    return apiCall(`/api/video/view_video_content/${contentId}`);
  },
  
  getDocumentContent: async (contentId: string) => {
    return apiCall(`/api/docs/view_doc/${contentId}`);
  },
  
  getQuizContent: async () => {
    return apiCall(`/api/quizz/random`);
  },
};

// Exam API
export const examApi = {
  getExamQuestions: async (examId: number) => {
    return apiCall(`/api/exam/${examId}/questions`);
  },
  
  submitExamAnswer: async (examId: number, questionId: string, answer: string) => {
    return apiCall(`/api/exam/${examId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ questionId, answer }),
    });
  },
};

export { apiCall };