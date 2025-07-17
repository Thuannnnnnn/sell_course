import axios from 'axios';
import { CreateQuizDto, UpdateQuizDto, Quiz, Question } from '../../types/quiz';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Quiz API functions
export const quizApi = {
  // Create a new quiz
  createQuiz: async (
    courseId: string,
    lessonId: string,
    contentId: string,
    quizData: CreateQuizDto
  ): Promise<Quiz> => {
    const response = await apiClient.post(
      `/api/instructor/courses/${courseId}/lessons/${lessonId}/contents/${contentId}/quizzes`,
      quizData
    );
    return response.data;
  },

  // Get quiz by ID
  getQuizById: async (
    courseId: string,
    lessonId: string,
    contentId: string,
    quizId: string
  ): Promise<Quiz> => {
    const url = `/api/instructor/courses/${courseId}/lessons/${lessonId}/contents/${contentId}/quizzes/${quizId}`;

    
    const response = await apiClient.get(url);

    return response.data;
  },

  // Get all quizzes by content ID
  getQuizzesByContentId: async (
    courseId: string,
    lessonId: string,
    contentId: string
  ): Promise<Quiz[]> => {
    const url = `/api/instructor/courses/${courseId}/lessons/${lessonId}/contents/${contentId}/quizzes`;

    
    const response = await apiClient.get(url);

    return response.data;
  },

  // Update quiz
  updateQuiz: async (
    courseId: string,
    lessonId: string,
    contentId: string,
    quizId: string,
    quizData: UpdateQuizDto
  ): Promise<Quiz> => {
    const url = `/api/instructor/courses/${courseId}/lessons/${lessonId}/contents/${contentId}/quizzes/${quizId}`;

    
    const response = await apiClient.put(url, quizData);

    return response.data;
  },

  // Delete quiz
  deleteQuiz: async (
    courseId: string,
    lessonId: string,
    contentId: string,
    quizId: string
  ): Promise<void> => {
    await apiClient.delete(
      `/api/instructor/courses/${courseId}/lessons/${lessonId}/contents/${contentId}/quizzes/${quizId}`
    );
  },

  // Delete all questions from quiz
  deleteAllQuestions: async (
    courseId: string,
    lessonId: string,
    contentId: string,
    quizId: string
  ): Promise<{ message: string; deletedCount: number }> => {
    const url = `/api/instructor/courses/${courseId}/lessons/${lessonId}/contents/${contentId}/quizzes/${quizId}/questions`;
    console.log('🌐 API: Deleting all questions:', { url, courseId, lessonId, contentId, quizId });
    
    const response = await apiClient.delete(url);
    console.log('✅ API: All questions deleted:', response.data);
    return response.data;
  },

  // Delete question
  deleteQuestion: async (
    courseId: string,
    lessonId: string,
    contentId: string,
    quizId: string,
    questionId: string
  ): Promise<void> => {
    await apiClient.delete(
      `/api/instructor/courses/${courseId}/lessons/${lessonId}/contents/${contentId}/quizzes/${quizId}/questions/${questionId}`
    );
  },

  // Get random quiz for users
  getRandomQuiz: async (
    courseId: string,
    lessonId: string,
    contentId: string,
    quizId?: string
  ): Promise<Question[]> => {
    const response = await apiClient.get(
      `/api/courses/${courseId}/lessons/${lessonId}/contents/${contentId}/quizzes/random`,
      {
        params: quizId ? { quizId } : {},
      }
    );
    return response.data;
  },
};

export default quizApi;