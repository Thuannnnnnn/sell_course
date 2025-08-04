import axios from "axios";
import {
  CreateExamDto,
  CreateExamFromQuizzesDto,
  UpdateExamQuestionDto,
  Exam,
  ExamQuestion,
  AvailableQuiz,
  ExamCreationConfig,
} from "../../../types/Course/exam/exam";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Exam API functions
export const examApi = {
  // Create exam from quiz questions in a course
  createExamFromQuizzes: async (
    courseId: string,
    token: string,
    config?: ExamCreationConfig
  ): Promise<Exam> => {
    const payload: CreateExamFromQuizzesDto = {
      courseId,
      ...config,
    };

    const response = await apiClient.post(
      "/api/admin/exam/create_from_quizzes",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  // Sync exam with latest quiz questions
  syncExamWithQuizzes: async (
    courseId: string,
    token: string
  ): Promise<Exam> => {
    const response = await apiClient.post(
      `/api/admin/exam/sync_with_quizzes/${courseId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  // Get available quizzes for exam creation
  getAvailableQuizzes: async (
    courseId: string,
    token: string
  ): Promise<AvailableQuiz[]> => {
    const response = await apiClient.get(
      `/api/admin/exam/available_quizzes/${courseId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  // Create exam with custom questions (original functionality)
  createExam: async (examData: CreateExamDto, token: string): Promise<Exam> => {
    const response = await apiClient.post(
      "/api/admin/exam/create_exam",
      examData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  // Get exam by course ID
  getExamById: async (courseId: string, token: string): Promise<Exam> => {
    const response = await apiClient.get(
      `/api/admin/exam/view_exam/${courseId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  // Delete exam
  deleteExam: async (
    examId: string,
    token: string
  ): Promise<{ message: string }> => {
    const response = await apiClient.delete(
      `/api/admin/exam/delete_exam/${examId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  // Get question by ID
  getQuestionById: async (
    questionId: string,
    token: string
  ): Promise<ExamQuestion> => {
    const response = await apiClient.get(
      `/api/admin/exam/view_question/${questionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  // Update question
  updateQuestion: async (
    questionId: string,
    questionData: UpdateExamQuestionDto,
    token: string
  ): Promise<ExamQuestion> => {
    const response = await apiClient.put(
      `/api/admin/exam/update_question/${questionId}`,
      questionData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  // Delete question
  deleteQuestion: async (
    questionId: string,
    token: string
  ): Promise<{ message: string }> => {
    const response = await apiClient.delete(
      `/api/admin/exam/delete_question/${questionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  // Utility function to get exam statistics
  getExamStats: async (
    courseId: string,
    token: string
  ): Promise<{
    totalQuestions: number;
    questionsByDifficulty: {
      easy: number;
      medium: number;
      hard: number;
    };
    totalWeight: number;
  }> => {
    const exam = await examApi.getExamById(courseId, token);

    const stats = {
      totalQuestions: exam.questions.length,
      questionsByDifficulty: {
        easy: exam.questions.filter((q) => q.difficulty === "easy").length,
        medium: exam.questions.filter((q) => q.difficulty === "medium").length,
        hard: exam.questions.filter((q) => q.difficulty === "hard").length,
      },
      totalWeight: exam.questions.reduce((sum, q) => sum + q.weight, 0),
    };

    return stats;
  },

  // Check if exam exists for a course
  checkExamExists: async (
    courseId: string,
    token: string
  ): Promise<boolean> => {
    try {
      await examApi.getExamById(courseId, token);
      return true;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  },

  // Get exam questions for student view (without correct answers)
  getExamForStudent: async (
    courseId: string,
    token: string
  ): Promise<{
    examId: string;
    courseId: string;
    questions: Array<{
      questionId: string;
      question: string;
      difficulty: string;
      weight: number;
      answers: Array<{
        answerId: string;
        answer: string;
      }>;
    }>;
  }> => {
    const exam = await examApi.getExamById(courseId, token);

    // Remove correct answer information for student view
    return {
      examId: exam.examId,
      courseId: exam.courseId,
      questions: exam.questions.map((question) => ({
        questionId: question.questionId,
        question: question.question,
        difficulty: question.difficulty,
        weight: question.weight,
        answers: question.answers.map((answer) => ({
          answerId: answer.answerId,
          answer: answer.answer,
        })),
      })),
    };
  },
};

export default examApi; // Exam Types and Interfaces
