import { 
  QuizResponse, 
  RandomQuizResponse, 
  SubmitQuizRequest, 
  QuizResultResponse,
  DetailedAnalysisResponse,
  QuizResult
} from '../../app/types/Course/Lesson/content/quizz';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class QuizAPI {
  private getAuthHeaders(token?: string) {
    // Try to get token from parameter first, then from localStorage
    const authToken = token || localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Get random quiz questions
  async getRandomQuiz(
    courseId: string, 
    lessonId: string, 
    contentId: string, 
    quizId?: string,
    token?: string
  ): Promise<RandomQuizResponse> {
    const url = `${API_BASE_URL}/api/courses/${courseId}/lessons/${lessonId}/contents/${contentId}/quizzes/random${quizId ? `?quizId=${quizId}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    return this.handleResponse<RandomQuizResponse>(response);
  }

  // Get specific quiz
  async getQuiz(
    courseId: string, 
    lessonId: string, 
    contentId: string, 
    quizId: string,
    token?: string
  ): Promise<QuizResponse> {
    const url = `${API_BASE_URL}/api/courses/${courseId}/lessons/${lessonId}/contents/${contentId}/quizzes/${quizId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    return this.handleResponse<QuizResponse>(response);
  }

  // Submit quiz answers
  async submitQuiz(
    courseId: string,
    lessonId: string,
    contentId: string,
    quizId: string,
    submitData: SubmitQuizRequest,
    token?: string
  ): Promise<QuizResultResponse> {
    const url = `${API_BASE_URL}/api/courses/${courseId}/lessons/${lessonId}/contents/${contentId}/quizzes/${quizId}/submit`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(submitData),
    });

    return this.handleResponse<QuizResultResponse>(response);
  }

  // Get quiz results
  async getQuizResults(
    courseId: string,
    lessonId: string,
    contentId: string,
    quizId: string,
    token?: string
  ): Promise<QuizResultResponse> {
    const url = `${API_BASE_URL}/api/courses/${courseId}/lessons/${lessonId}/contents/${contentId}/quizzes/${quizId}/results`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    return this.handleResponse<QuizResultResponse>(response);
  }

  // Get detailed quiz analysis
  async getDetailedAnalysis(
    courseId: string,
    lessonId: string,
    contentId: string,
    quizId: string,
    token?: string
  ): Promise<DetailedAnalysisResponse> {
    const url = `${API_BASE_URL}/api/courses/${courseId}/lessons/${lessonId}/contents/${contentId}/quizzes/${quizId}/detailed-analysis`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    return this.handleResponse<DetailedAnalysisResponse>(response);
  }

  // Get all user quiz results
  async getAllUserQuizResults(token?: string): Promise<{ success: boolean; data?: QuizResult[]; message?: string }> {
    const url = `${API_BASE_URL}/api/user/quiz-results`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    try {
      const data = await this.handleResponse<QuizResult[]>(response);
      // Backend trả về array trực tiếp, cần wrap trong success format
      return { success: true, data: Array.isArray(data) ? data : [data] };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Failed to fetch results' };
    }
  }

  // Get user quiz results by course
  async getUserQuizResultsByCourse(courseId: string, token?: string): Promise<{ success: boolean; data?: QuizResult[]; message?: string }> {
    const url = `${API_BASE_URL}/api/user/quiz-results/courses/${courseId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    try {
      const data = await this.handleResponse<QuizResult[]>(response);
      return { success: true, data: Array.isArray(data) ? data : [data] };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Failed to fetch results' };
    }
  }

  // Get user quiz results by lesson
  async getUserQuizResultsByLesson(courseId: string, lessonId: string, token?: string): Promise<{ success: boolean; data?: QuizResult[]; message?: string }> {
    const url = `${API_BASE_URL}/api/user/quiz-results/courses/${courseId}/lessons/${lessonId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    try {
      const data = await this.handleResponse<QuizResult[]>(response);
      return { success: true, data: Array.isArray(data) ? data : [data] };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Failed to fetch results' };
    }
  }

  // Get quiz results by content
  async getQuizResultsByContent(
    courseId: string,
    lessonId: string,
    contentId: string,
    token?: string
  ): Promise<{ success: boolean; data?: QuizResult[]; message?: string }> {
    const url = `${API_BASE_URL}/api/courses/${courseId}/lessons/${lessonId}/contents/${contentId}/quizzes/results`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    return this.handleResponse<{ success: boolean; data?: QuizResult[]; message?: string }>(response);
  }
}

export const quizAPI = new QuizAPI();
export default quizAPI;