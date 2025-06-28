import {
  SubmitExamDto,
  ResultExam,
  UserExamResult,
  ExamQuestion,
} from "@/app/types/exam/result-exam";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMessage =
        typeof data === "object" && data.message
          ? data.message
          : "An error occurred";
      throw new ApiError(errorMessage, response.status);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError("Network error or server unavailable", 0);
  }
}

// Result Exam API functions
export const resultExamApi = {
  // Submit exam (requires authentication)
  submitExam: async (
    submitExamDto: SubmitExamDto,
    token: string
  ): Promise<ResultExam> => {
    return apiCall<ResultExam>("/api/users/user/submit", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(submitExamDto),
    });
  },

  // Get specific exam results for user (requires authentication)
  getUserExamResults: async (
    courseId: string,
    token: string
  ): Promise<UserExamResult> => {
    return apiCall<UserExamResult>(
      `/api/users/user/results/${courseId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  // Get all exam results for user (requires authentication)
  getAllUserExamResults: async (token: string): Promise<UserExamResult[]> => {
    return apiCall<UserExamResult[]>("/api/users/user/results", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Get questions for exam (requires authentication)
  getQuestionsForUser: async (
    courseId: string,
    token: string
  ): Promise<ExamQuestion[]> => {
    return apiCall<ExamQuestion[]>(
      `/api/users/user/questions/${courseId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  // Get all exam results (admin/instructor endpoint - requires authentication)
  getAllExamResults: async (token: string): Promise<ResultExam[]> => {
    return apiCall<ResultExam[]>("/api/exam/results/all", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

// Helper functions for exam handling
export const examHelpers = {
  // Calculate percentage score
  calculatePercentageScore: (correctAnswers: number, totalQuestions: number): number => {
    if (totalQuestions === 0) return 0;
    return parseFloat(((correctAnswers / totalQuestions) * 100).toFixed(2));
  },

  // Format score for display
  formatScore: (score: number): string => {
    return `${score.toFixed(2)}%`;
  },

  // Check if user passed exam (assuming 70% is passing)
  isPassed: (score: number, passingScore: number = 70): boolean => {
    return score >= passingScore;
  },

  // Get difficulty color for UI
  getDifficultyColor: (difficulty: 'easy' | 'medium' | 'hard'): string => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'hard':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  },

  // Format exam date
  formatExamDate: (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  // Shuffle array (for randomizing questions/answers)
  shuffleArray: <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  // Validate exam submission
  validateExamSubmission: (submission: SubmitExamDto): string[] => {
    const errors: string[] = [];

    if (!submission.examId || submission.examId.trim() === '') {
      errors.push('Exam ID is required');
    }

    if (!submission.courseId || submission.courseId.trim() === '') {
      errors.push('Course ID is required');
    }

    if (!submission.answers || submission.answers.length === 0) {
      errors.push('At least one answer is required');
    }

    submission.answers?.forEach((answer, index) => {
      if (!answer.questionId || answer.questionId.trim() === '') {
        errors.push(`Question ID is required for answer ${index + 1}`);
      }
      if (!answer.answerId || answer.answerId.trim() === '') {
        errors.push(`Answer ID is required for answer ${index + 1}`);
      }
    });

    return errors;
  },
};

export default resultExamApi;