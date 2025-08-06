import {
  ContentProgress,
  LearningPathInput,
  LearningPathProgress,
  LearningPlanData,
  LearningPlanSummary,
  RawQuestion,
} from "@/app/types/learningPath/learningPath";
import axios, { AxiosResponse } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export class LearningPathAPI {
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
   * Lấy learning path theo userId
   * Trả về 404 nếu chưa có learning path
   */
  async getLearningPathByUserId(userId: string): Promise<LearningPlanData[]> {
    try {
      const response: AxiosResponse<LearningPlanData[]> = await axios.get(
        `${API_BASE_URL}/learningPath/user/${userId}`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data.message || "Lỗi không xác định");
      }
      throw new Error("Lỗi không xác định");
    }
  }

  /**
   * Lấy learning path theo planId
   */
  async getLearningPathById(planId: string): Promise<LearningPlanData> {
    const response: AxiosResponse<LearningPlanData> = await axios.get(
      `${API_BASE_URL}/learningPath/getById/${planId}`,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  /**
   * Lưu learning path từ dữ liệu n8n đã xử lý
   */
  async saveLearningPathFromN8n(n8nData: LearningPlanData) {
    const response: AxiosResponse<void> = await axios.post(
      `${API_BASE_URL}/learningPath/from-n8n`,
      n8nData,
      { headers: this.getHeaders() }
    );
    return response;
  }
  /**
   * Cập nhật learning path
   */
  async updateLearningPath(
    planId: string,
    updateData: Partial<LearningPathInput>
  ): Promise<LearningPlanData> {
    const response: AxiosResponse<LearningPlanData> = await axios.put(
      `${API_BASE_URL}/learningPath/update/${planId}`,
      updateData,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  /**
   * Xóa learning path
   */
  async deleteLearningPath(planId: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/learningPath/delete/${planId}`, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Lấy danh sách tất cả learning paths của user (summary)
   */
  async getLearningPathsList(userId: string): Promise<LearningPlanSummary[]> {
    const response: AxiosResponse<LearningPlanSummary[]> = await axios.get(
      `${API_BASE_URL}/learningPath/user/${userId}`,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  /**
   * Lấy content IDs từ learning path để tracking progress
   */
  async getContentIds(
    planId: string
  ): Promise<{ planId: string; contentIds: string[] }> {
    const response: AxiosResponse<{ planId: string; contentIds: string[] }> =
      await axios.get(`${API_BASE_URL}/learningPath/content-ids/${planId}`, {
        headers: this.getHeaders(),
      });
    return response.data;
  }

  /**
   * Lấy progress của nhiều content cùng lúc
   */
  async getBulkContentProgress(
    userId: string,
    contentIds: string[]
  ): Promise<Record<string, ContentProgress>> {
    const response: AxiosResponse<Record<string, ContentProgress>> =
      await axios.post(
        `${API_BASE_URL}/progress/bulk-status/user/${userId}`,
        { contentIds },
        { headers: this.getHeaders() }
      );
    return response.data;
  }

  /**
   * Lấy tổng quan progress của learning path
   */
  async getLearningPathProgress(
    userId: string,
    contentIds: string[]
  ): Promise<LearningPathProgress> {
    const response: AxiosResponse<LearningPathProgress> = await axios.post(
      `${API_BASE_URL}/progress/learning-path-progress/user/${userId}`,
      { contentIds },
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  /**
   * Cập nhật status của content
   */
  async updateContentStatus(
    contentId: string,
    userId: string,
    status: "not_started" | "in_progress" | "completed",
    progressPercentage?: number,
    timeSpentMinutes?: number
  ): Promise<ContentProgress> {
    const response: AxiosResponse<ContentProgress> = await axios.put(
      `${API_BASE_URL}/progress/content/${contentId}/user/${userId}`,
      {
        status,
        progressPercentage,
        timeSpentMinutes,
      },
      { headers: this.getHeaders() }
    );
    return response.data;
  }
}

/**
 * N8n API Service
 */
export class N8nAPI {
  private webhookUrl: string;

  constructor() {
    this.webhookUrl =
      `${process.env.NEXT_PUBLIC_N8N_URL}/learningPath` ||
      "https://your-n8n-instance.com/webhook/learning-path";
  }

  /**
   * Gửi dữ liệu learning path input tới n8n để xử lý
   */
  async processLearningPath(
    learningPathInput: LearningPathInput
  ): Promise<LearningPlanData> {
    try {
      const response: AxiosResponse<LearningPlanData> = await axios.post(
        this.webhookUrl,
        learningPathInput,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("N8n API call failed:", error);
      throw new Error("Failed to process learning path data");
    }
  }
}

/**
 * Survey Questions API
 */
export class SurveyAPI {
  async getQuestions(): Promise<RawQuestion[]> {
    const response: AxiosResponse<RawQuestion[]> = await axios.get(
      `${API_BASE_URL}/survey-questions`
    );
    return response.data;
  }
}

/**
 * Factory function để tạo LearningPathAPI instance
 */
export const createLearningPathAPI = (token: string): LearningPathAPI => {
  return new LearningPathAPI(token);
};

/**
 * Factory function để tạo ProgressTrackingAPI instance
 */

/**
 * Factory function để tạo N8nAPI instance
 */
export const createN8nAPI = (): N8nAPI => {
  return new N8nAPI();
};

/**
 * Factory function để tạo SurveyAPI instance
 */
export const createSurveyAPI = (): SurveyAPI => {
  return new SurveyAPI();
};
