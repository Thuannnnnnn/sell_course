import {
  BulkProgressRequest,
  BulkProgressResponse,
  CompletedCountResponse,
  CompletedLessonsCount,
  ContentProgressStatus,
  CourseProgressResponse,
  LessonProgressResponseDto,
  MarkProgressDto,
  ProgressTrackingEntity,
} from "@/app/types/learningPath/learningPath";
import axios, { AxiosResponse } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
export class ProgressTrackingAPI {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private getHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.token}`,
    };
  }

  /**
   * Mark content as completed
   */
  async markAsCompleted(
    userId: string,
    contentId: string,
    lessonId: string
  ): Promise<ProgressTrackingEntity> {
    const markProgressDto: MarkProgressDto = {
      userId,
      contentId,
      lessonId,
    };

    const response: AxiosResponse<ProgressTrackingEntity> = await axios.post(
      `${API_BASE_URL}/progress/complete`,
      markProgressDto,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  /**
   * Get lesson progress
   */
  async getLessonProgress(
    lessonId: string,
    userId: string
  ): Promise<LessonProgressResponseDto> {
    const response: AxiosResponse<LessonProgressResponseDto> = await axios.get(
      `${API_BASE_URL}/progress/lesson/${lessonId}/user/${userId}`,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  /**
   * Get completed contents count in lesson
   */
  async getCompletedContentsCount(
    lessonId: string,
    userId: string
  ): Promise<CompletedCountResponse> {
    const response: AxiosResponse<CompletedCountResponse> = await axios.get(
      `${API_BASE_URL}/progress/lesson/${lessonId}/user/${userId}/completed-contents-count`,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  /**
   * Get course progress
   */
  async getCourseProgress(
    courseId: string,
    userId: string
  ): Promise<CourseProgressResponse> {
    const response: AxiosResponse<CourseProgressResponse> = await axios.get(
      `${API_BASE_URL}/progress/course/${courseId}/user/${userId}/progress`,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  /**
   * Get content completion status
   */
  async getContentStatus(
    contentId: string,
    userId: string
  ): Promise<ContentProgressStatus> {
    const response: AxiosResponse<ContentProgressStatus> = await axios.get(
      `${API_BASE_URL}/progress/content/${contentId}/user/${userId}/status`,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  /**
   * Get completed lessons count in course
   */
  async getCompletedLessonsCountInCourse(
    courseId: string,
    userId: string
  ): Promise<CompletedLessonsCount> {
    const response: AxiosResponse<CompletedLessonsCount> = await axios.get(
      `${API_BASE_URL}/progress/course/${courseId}/user/${userId}/completed-lessons-count`,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  /**
   * NEW: Get bulk content progress status
   * Endpoint: GET /content-progress/bulk-status/user/{userId}
   */
  async getBulkContentProgressStatus(
    userId: string,
    contentIds: string[]
  ): Promise<BulkProgressResponse> {
    const requestData: BulkProgressRequest = { contentIds };

    const response: AxiosResponse<BulkProgressResponse> = await axios.post(
      `${API_BASE_URL}/content-progress/bulk-status/user/${userId}`,
      requestData,
      { headers: this.getHeaders() }
    );
    return response.data;
  }
}

export const createProgressTrackingAPI = (
  token: string
): ProgressTrackingAPI => {
  return new ProgressTrackingAPI(token);
};
