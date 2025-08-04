import axios from 'axios';
import { getSession } from 'next-auth/react';
import type { 
  CreateExamFromQuizzesDto,
  CreateExamDto,
  UpdateExamQuestionDto
} from '../../types/exam';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(async (config) => {
  try {
    const session = await getSession();
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
  } catch (error) {
    console.warn('Failed to get session for API request:', error);
  }
  return config;
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const examApi = {
  // Get exam by course ID
  getExamByCourseId: async (courseId: string) => {
    try {
      const response = await apiClient.get(`/api/student/exam/${courseId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null; // No exam exists for this course
      }
      throw error;
    }
  },

  // Create exam from quizzes
  createExamFromQuizzes: async (config: CreateExamFromQuizzesDto) => {
    const response = await apiClient.post('/api/admin/exam/create_from_quizzes', config);
    return response.data;
  },

  // Sync exam with quizzes
  syncExamWithQuizzes: async (courseId: string) => {
    const response = await apiClient.post(`/api/admin/exam/sync_with_quizzes/${courseId}`);
    return response.data;
  },

  // Get available quizzes for exam creation
  getAvailableQuizzes: async (courseId: string) => {
    const response = await apiClient.get(`/api/admin/exam/available_quizzes/${courseId}`);
    return response.data;
  },

  // Create exam
  createExam: async (examData: CreateExamDto) => {
    const response = await apiClient.post('/api/admin/exam/create_exam', examData);
    return response.data;
  },

  // Get exam by ID
  getExamById: async (examId: string) => {
    const response = await apiClient.get(`/api/admin/exam/view_exam/${examId}`);
    return response.data;
  },

  // Get exam stats
  getExamStats: async (courseId: string) => {
    const response = await apiClient.get(`/api/admin/exam/stats/${courseId}`);
    return response.data;
  },

  // Check if exam exists
  examExists: async (courseId: string) => {
    const response = await apiClient.get(`/api/admin/exam/exists/${courseId}`);
    return response.data;
  },

  // Add question to exam
  addQuestion: async (courseId: string, questionData: UpdateExamQuestionDto) => {
    const response = await apiClient.post(`/api/admin/exam/add_question/${courseId}`, questionData);
    return response.data;
  },

  // Delete question from exam
  deleteQuestion: async (questionId: string) => {
    const response = await apiClient.delete(`/api/admin/exam/delete_question/${questionId}`);
    return response.data;
  },

  // Delete exam
  deleteExam: async (examId: string) => {
    const response = await apiClient.delete(`/api/admin/exam/delete_exam/${examId}`);
    return response.data;
  },

  // Get question by ID
  getQuestionById: async (questionId: string) => {
    const response = await apiClient.get(`/api/admin/exam/view_question/${questionId}`);
    return response.data;
  },

  // Update question
  updateQuestion: async (questionId: string, questionData: UpdateExamQuestionDto) => {
    const response = await apiClient.put(`/api/admin/exam/update_question/${questionId}`, questionData);
    return response.data;
  },
};

export default examApi;
