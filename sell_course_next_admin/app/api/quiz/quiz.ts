import axios from 'axios';
import { getSession } from 'next-auth/react';
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
apiClient.interceptors.request.use(async (config) => {
  try {
    // Get NextAuth session
    const session = await getSession();
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
      console.log('🔐 Using NextAuth token for:', config.url);
    } else {
      console.warn('⚠️ No NextAuth session found');
    }
  } catch (error) {
    console.error('Error getting session token:', error);
    // Fallback to localStorage for compatibility
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔐 Using localStorage token for:', config.url);
      } else {
        console.warn('⚠️ No token found in localStorage either');
      }
    }
  }
  return config;
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('🚫 Unauthorized access - token may be expired');
      // Could redirect to login here if needed
    }
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Quiz API functions
export const quizApi = {
  // Create a new quiz
  createQuiz: async (
    courseId: string,
    lessonId: string,
    contentId: string,
    quizData: CreateQuizDto
  ): Promise<Quiz> => {
    try {
      console.log('🚀 Creating quiz:', { courseId, lessonId, contentId, quizData });
      const response = await apiClient.post(
        `/api/instructor/courses/${courseId}/lessons/${lessonId}/contents/${contentId}/quizzes`,
        quizData
      );
      console.log('✅ Quiz created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to create quiz:', error);
      throw error;
    }
  },

  // Get quiz by ID
  getQuizById: async (
    courseId: string,
    lessonId: string,
    contentId: string,
    quizId: string
  ): Promise<Quiz> => {
    try {
      const url = `/api/instructor/courses/${courseId}/lessons/${lessonId}/contents/${contentId}/quizzes/${quizId}`;
      console.log('🔍 Getting quiz by ID:', { url, quizId });
      
      const response = await apiClient.get(url);
      console.log('✅ Quiz retrieved successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get quiz:', error);
      throw error;
    }
  },

  // Get all quizzes by content ID
  getQuizzesByContentId: async (
    courseId: string,
    lessonId: string,
    contentId: string
  ): Promise<Quiz[]> => {
    try {
      const url = `/api/instructor/courses/${courseId}/lessons/${lessonId}/contents/${contentId}/quizzes`;
      console.log('📋 Getting quizzes by content ID:', { url, contentId });
      
      const response = await apiClient.get(url);
      console.log('✅ Quizzes retrieved successfully:', response.data.length, 'items');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get quizzes:', error);
      throw error;
    }
  },

  // Update quiz
  updateQuiz: async (
    courseId: string,
    lessonId: string,
    contentId: string,
    quizId: string,
    quizData: UpdateQuizDto
  ): Promise<Quiz> => {
    try {
      const url = `/api/instructor/courses/${courseId}/lessons/${lessonId}/contents/${contentId}/quizzes/${quizId}`;
      console.log('🔄 Updating quiz:', { url, quizId, quizData });
      
      const response = await apiClient.put(url, quizData);
      console.log('✅ Quiz updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to update quiz:', error);
      throw error;
    }
  },

  // Delete quiz
  deleteQuiz: async (
    courseId: string,
    lessonId: string,
    contentId: string,
    quizId: string
  ): Promise<void> => {
    try {
      const url = `/api/instructor/courses/${courseId}/lessons/${lessonId}/contents/${contentId}/quizzes/${quizId}`;
      console.log('🗑️ Deleting quiz:', { url, quizId });
      
      await apiClient.delete(url);
      console.log('✅ Quiz deleted successfully');
    } catch (error) {
      console.error('❌ Failed to delete quiz:', error);
      throw error;
    }
  },

  // Delete all questions from quiz
  deleteAllQuestions: async (
    courseId: string,
    lessonId: string,
    contentId: string,
    quizId: string
  ): Promise<{ message: string; deletedCount: number }> => {
    try {
      const url = `/api/instructor/courses/${courseId}/lessons/${lessonId}/contents/${contentId}/quizzes/${quizId}/questions`;
      console.log('🌐 API: Deleting all questions:', { url, courseId, lessonId, contentId, quizId });
      
      const response = await apiClient.delete(url);
      console.log('✅ API: All questions deleted:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to delete all questions:', error);
      throw error;
    }
  },

  // Delete question
  deleteQuestion: async (
    courseId: string,
    lessonId: string,
    contentId: string,
    quizId: string,
    questionId: string
  ): Promise<void> => {
    try {
      const url = `/api/instructor/courses/${courseId}/lessons/${lessonId}/contents/${contentId}/quizzes/${quizId}/questions/${questionId}`;
      console.log('🗑️ Deleting question:', { url, questionId });
      
      await apiClient.delete(url);
      console.log('✅ Question deleted successfully');
    } catch (error) {
      console.error('❌ Failed to delete question:', error);
      throw error;
    }
  },

  // Get random quiz for users
  getRandomQuiz: async (
    courseId: string,
    lessonId: string,
    contentId: string,
    quizId?: string
  ): Promise<Question[]> => {
    try {
      const url = `/api/courses/${courseId}/lessons/${lessonId}/contents/${contentId}/quizzes/random`;
      console.log('🎲 Getting random quiz:', { url, quizId });
      
      const response = await apiClient.get(url, {
        params: quizId ? { quizId } : {},
      });
      console.log('✅ Random quiz retrieved:', response.data.length, 'questions');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get random quiz:', error);
      throw error;
    }
  },
};

export default quizApi;