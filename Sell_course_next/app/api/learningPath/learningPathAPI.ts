import axios, { AxiosResponse, AxiosError } from "axios";
import {
  ApiResponse,
  LearningPlan,
  CreateLearningPlanRequest,
  UpdateLearningPlanRequest,
  DeleteResult,
  LearningPathInput,
  LearningPathData,
  N8nPayload,
  transformLearningPathInputToCreateRequest,
  transformLearningPlanToLearningPathData,
  transformLearningPathDataToUpdateRequest,
  transformToN8nFormat,
  transformFromN8nResponse,
  validateLearningPathInput,
  validateCreateLearningPlanRequest,
  isLearningPlan,
  isLearningPathData,
} from "./../../types/learningPath/learningPath";

interface LearningPathApiConfig {
  baseURL: string;
  apiPath: string;
  n8nWebhookURL: string;
}

class ImprovedLearningPathApi {
  private config: LearningPathApiConfig;

  constructor() {
    this.config = {
      baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
      apiPath: "/learningPath",
      n8nWebhookURL:
        process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL ||
        "https://n8n.coursemaster.io.vn/webhook/generate-learning-path",
    };
  }

  private getFullUrl(endpoint: string = ""): string {
    return `${this.config.baseURL}${this.config.apiPath}${endpoint}`;
  }

  private async handleRequest<T>(
    requestPromise: Promise<AxiosResponse<T>>
  ): Promise<ApiResponse<T>> {
    try {
      const response = await requestPromise;
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("API Error:", error);

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;

        let errorMessage = "Có lỗi xảy ra khi gọi API";

        if (axiosError.code === "ECONNABORTED") {
          errorMessage = "Timeout khi gọi API. Vui lòng thử lại.";
        } else if (axiosError.response?.status === 404) {
          errorMessage = "Không tìm thấy tài nguyên yêu cầu.";
        } else if (axiosError.response?.status === 401) {
          errorMessage = "Không có quyền truy cập. Vui lòng đăng nhập lại.";
        } else if (axiosError.response?.status === 403) {
          errorMessage = "Không có quyền thực hiện thao tác này.";
        } else if (
          axiosError.response?.status &&
          axiosError.response.status >= 500
        ) {
          errorMessage = "Lỗi server. Vui lòng thử lại sau.";
        } else if (axiosError.response?.data) {
          const responseData = axiosError.response.data as Record<
            string,
            unknown
          >;
          errorMessage =
            (responseData.message as string) ||
            (responseData.error as string) ||
            errorMessage;
        }

        return {
          success: false,
          error: errorMessage,
        };
      }

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Có lỗi không xác định xảy ra",
      };
    }
  }

  // ===== CORE CRUD OPERATIONS =====

  /**
   * Tạo learning plan mới
   * POST /learningPath
   */
  async createLearningPlan(
    planData: CreateLearningPlanRequest
  ): Promise<ApiResponse<LearningPlan>> {
    // Validate input
    const validationErrors = validateCreateLearningPlanRequest(planData);
    if (validationErrors.length > 0) {
      return {
        success: false,
        error: `Validation errors: ${validationErrors.join(", ")}`,
      };
    }

    const request = axios.post<LearningPlan>(this.getFullUrl(), planData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return this.handleRequest(request);
  }

  /**
   * Lấy tất cả learning plans
   * GET /learningPath/getAll
   */
  async getAllLearningPlans(): Promise<ApiResponse<LearningPlan[]>> {
    const request = axios.get<LearningPlan[]>(this.getFullUrl("/getAll"));

    return this.handleRequest(request);
  }

  /**
   * Lấy learning plan theo ID
   * GET /learningPath/getById/:id
   */
  async getLearningPlanById(id: string): Promise<ApiResponse<LearningPlan>> {
    if (!id || typeof id !== "string") {
      return {
        success: false,
        error: "Learning plan ID is required and must be a string",
      };
    }

    const request = axios.get<LearningPlan>(
      this.getFullUrl(`/getById/${encodeURIComponent(id)}`)
    );

    return this.handleRequest(request);
  }

  /**
   * Lấy learning plans theo user ID
   * GET /learningPath/user/:userId
   */
  async getLearningPlansByUserId(
    userId: string
  ): Promise<ApiResponse<LearningPlan[]>> {
    if (!userId || typeof userId !== "string") {
      return {
        success: false,
        error: "User ID is required and must be a string",
      };
    }

    const request = axios.get<LearningPlan[]>(
      this.getFullUrl(`/user/${encodeURIComponent(userId)}`)
    );

    return this.handleRequest(request);
  }

  /**
   * Cập nhật learning plan
   * PUT /learningPath/update/:id
   */
  async updateLearningPlan(
    id: string,
    updateData: UpdateLearningPlanRequest
  ): Promise<ApiResponse<LearningPlan>> {
    if (!id || typeof id !== "string") {
      return {
        success: false,
        error: "Learning plan ID is required and must be a string",
      };
    }

    const request = axios.put<LearningPlan>(
      this.getFullUrl(`/update/${encodeURIComponent(id)}`),
      updateData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return this.handleRequest(request);
  }

  /**
   * Xóa learning plan
   * DELETE /learningPath/delete/:id
   */
  async deleteLearningPlan(id: string): Promise<ApiResponse<DeleteResult>> {
    if (!id || typeof id !== "string") {
      return {
        success: false,
        error: "Learning plan ID is required and must be a string",
      };
    }

    const request = axios.delete<DeleteResult>(
      this.getFullUrl(`/delete/${encodeURIComponent(id)}`)
    );

    return this.handleRequest(request);
  }

  // ===== ENHANCED OPERATIONS =====

  /**
   * Tạo learning path thông qua n8n webhook (improved version)
   */
  async generateLearningPath(
    learningPathInput: LearningPathInput
  ): Promise<ApiResponse<LearningPathData>> {
    // Validate input
    const validationErrors = validateLearningPathInput(learningPathInput);
    if (validationErrors.length > 0) {
      return {
        success: false,
        error: `Validation errors: ${validationErrors.join(", ")}`,
      };
    }

    try {
      // Transform input to n8n format
      const n8nPayload: N8nPayload = transformToN8nFormat(learningPathInput);

      console.log("Sending to n8n:", JSON.stringify(n8nPayload, null, 2));

      const response = await axios.post(this.config.n8nWebhookURL, n8nPayload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Response from n8n:", JSON.stringify(response.data, null, 2));

      const transformedData = transformFromN8nResponse(response.data);

      if (!isLearningPathData(transformedData)) {
        return {
          success: false,
          error: "Invalid response format from n8n service",
        };
      }

      return {
        success: true,
        data: transformedData,
      };
    } catch (error) {
      console.error("Error generating learning path via n8n:", error);

      let errorMessage = "Không thể tạo learning path. Vui lòng thử lại.";

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;

        if (axiosError.code === "ECONNABORTED") {
          errorMessage = "Timeout khi tạo learning path. Vui lòng thử lại.";
        } else if (axiosError.response?.status === 404) {
          errorMessage = "Không tìm thấy service tạo learning path.";
        } else if (
          axiosError.response?.status &&
          axiosError.response.status >= 500
        ) {
          errorMessage = "Lỗi server khi tạo learning path.";
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Lưu learning path đã được generate vào backend
   */
  async saveLearningPath(
    userId: string,
    courseId: string,
    data: LearningPathData,
    input: LearningPathInput
  ): Promise<ApiResponse<LearningPlan>> {
    if (!userId || typeof userId !== "string") {
      return {
        success: false,
        error: "User ID is required and must be a string",
      };
    }

    if (!courseId || typeof courseId !== "string") {
      return {
        success: false,
        error: "Course ID is required and must be a string",
      };
    }

    if (!isLearningPathData(data)) {
      return {
        success: false,
        error: "Invalid learning path data format",
      };
    }

    try {
      // Transform to backend DTO format
      const createRequest = transformLearningPathInputToCreateRequest(
        input,
        courseId
      );

      // Add generated data
      createRequest.narrativeTemplates = data.scheduleItems.narrativeText;
      createRequest.scheduleItems = data.scheduleItems.scheduleData;

      console.log("Saving to backend:", JSON.stringify(createRequest, null, 2));

      const response = await this.createLearningPlan(createRequest);

      if (!response.success || !response.data) {
        return {
          success: false,
          error: response.error || "Failed to save learning path",
        };
      }

      if (!isLearningPlan(response.data)) {
        return {
          success: false,
          error: "Invalid response format from backend",
        };
      }

      return response;
    } catch (error) {
      console.error("Error saving learning path:", error);
      return {
        success: false,
        error: "Có lỗi xảy ra khi lưu learning path",
      };
    }
  }

  /**
   * Lấy learning path theo ID và transform sang format hiển thị
   */
  async getLearningPath(
    learningPathId: string
  ): Promise<ApiResponse<LearningPathData>> {
    try {
      const response = await this.getLearningPlanById(learningPathId);

      if (!response.success || !response.data) {
        return {
          success: false,
          error: response.error || "Không tìm thấy learning path",
        };
      }

      if (!isLearningPlan(response.data)) {
        return {
          success: false,
          error: "Invalid learning plan format",
        };
      }

      const transformedData = transformLearningPlanToLearningPathData(
        response.data
      );

      return {
        success: true,
        data: transformedData,
      };
    } catch (error) {
      console.error("Error fetching learning path:", error);
      return {
        success: false,
        error: "Có lỗi xảy ra khi tải learning path",
      };
    }
  }

  /**
   * Lấy learning paths của user cho course cụ thể
   */
  async getUserLearningPathsForCourse(
    userId: string,
    courseId: string
  ): Promise<ApiResponse<LearningPlan[]>> {
    if (!userId || typeof userId !== "string") {
      return {
        success: false,
        error: "User ID is required and must be a string",
      };
    }

    if (!courseId || typeof courseId !== "string") {
      return {
        success: false,
        error: "Course ID is required and must be a string",
      };
    }

    try {
      const response = await this.getLearningPlansByUserId(userId);

      if (!response.success || !response.data) {
        return response;
      }

      const filteredPlans = response.data.filter(
        (plan) => plan.courseId === courseId
      );

      return {
        success: true,
        data: filteredPlans,
      };
    } catch (error) {
      console.error("Error fetching user learning paths:", error);
      return {
        success: false,
        error: "Có lỗi xảy ra khi tải danh sách learning path",
      };
    }
  }

  /**
   * Cập nhật learning path với data mới
   */
  async updateLearningPath(
    learningPathId: string,
    data: LearningPathData
  ): Promise<ApiResponse<LearningPlan>> {
    if (!learningPathId || typeof learningPathId !== "string") {
      return {
        success: false,
        error: "Learning path ID is required and must be a string",
      };
    }

    if (!isLearningPathData(data)) {
      return {
        success: false,
        error: "Invalid learning path data format",
      };
    }

    try {
      const updateRequest = transformLearningPathDataToUpdateRequest(data);
      const response = await this.updateLearningPlan(
        learningPathId,
        updateRequest
      );

      if (!response.success || !response.data) {
        return {
          success: false,
          error: response.error || "Failed to update learning path",
        };
      }

      if (!isLearningPlan(response.data)) {
        return {
          success: false,
          error: "Invalid response format from backend",
        };
      }

      return response;
    } catch (error) {
      console.error("Error updating learning path:", error);
      return {
        success: false,
        error: "Có lỗi xảy ra khi cập nhật learning path",
      };
    }
  }

  // ===== UTILITY METHODS =====

  /**
   * Kiểm tra xem user đã có learning plan cho course chưa
   */
  async hasLearningPlanForCourse(
    userId: string,
    courseId: string
  ): Promise<ApiResponse<boolean>> {
    try {
      const response = await this.getUserLearningPathsForCourse(
        userId,
        courseId
      );

      if (!response.success) {
        return {
          success: false,
          error: response.error,
        };
      }

      const hasPlans = response.data && response.data.length > 0;

      return {
        success: true,
        data: hasPlans,
      };
    } catch (error) {
      return {
        success: false,
        error: "Có lỗi xảy ra khi kiểm tra learning plan" + error,
      };
    }
  }

  /**
   * Lấy learning plan mới nhất của user cho course
   */
  async getLatestLearningPlanForCourse(
    userId: string,
    courseId: string
  ): Promise<ApiResponse<LearningPlan | null>> {
    try {
      const response = await this.getUserLearningPathsForCourse(
        userId,
        courseId
      );

      if (!response.success || !response.data) {
        return {
          success: response.success,
          error: response.error,
          data: null,
        };
      }

      if (response.data.length === 0) {
        return {
          success: true,
          data: null,
        };
      }

      // Sắp xếp theo thời gian tạo và lấy cái mới nhất
      const latestPlan = response.data.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];

      if (!isLearningPlan(latestPlan)) {
        return {
          success: false,
          error: "Invalid learning plan format",
          data: null,
        };
      }

      return {
        success: true,
        data: latestPlan,
      };
    } catch (error) {
      return {
        success: false,
        error: "Có lỗi xảy ra khi lấy learning plan mới nhất" + error,
        data: null,
      };
    }
  }

  /**
   * Lấy learning path mới nhất của user cho course (format hiển thị)
   */
  async getLatestLearningPathForCourse(
    userId: string,
    courseId: string
  ): Promise<ApiResponse<LearningPathData | null>> {
    try {
      const response = await this.getLatestLearningPlanForCourse(
        userId,
        courseId
      );

      if (!response.success || !response.data) {
        return {
          success: response.success,
          error: response.error,
          data: null,
        };
      }

      const transformedData = transformLearningPlanToLearningPathData(
        response.data
      );

      return {
        success: true,
        data: transformedData,
      };
    } catch (error) {
      return {
        success: false,
        error: "Có lỗi xảy ra khi lấy learning path mới nhất" + error,
        data: null,
      };
    }
  }

  /**
   * Kiểm tra và lấy learning path hiện có hoặc tạo mới
   */
  async getOrCreateLearningPath(
    userId: string,
    courseId: string,
    input?: LearningPathInput
  ): Promise<
    ApiResponse<{
      data: LearningPathData;
      planId: string | null;
      isExisting: boolean;
    }>
  > {
    try {
      // Kiểm tra xem đã có learning path chưa
      const existingResponse = await this.getLatestLearningPathForCourse(
        userId,
        courseId
      );

      if (existingResponse.success && existingResponse.data) {
        const latestPlanResponse = await this.getLatestLearningPlanForCourse(
          userId,
          courseId
        );

        return {
          success: true,
          data: {
            data: existingResponse.data,
            planId: latestPlanResponse.data?.planId || null,
            isExisting: true,
          },
        };
      }

      // Nếu chưa có và có input, tạo mới
      if (input) {
        const generateResponse = await this.generateLearningPath(input);

        if (!generateResponse.success || !generateResponse.data) {
          return {
            success: false,
            error: generateResponse.error || "Failed to generate learning path",
          };
        }

        return {
          success: true,
          data: {
            data: generateResponse.data,
            planId: null,
            isExisting: false,
          },
        };
      }

      // Nếu chưa có và không có input
      return {
        success: true,
        data: {
          data: {
            scheduleItems: {
              scheduleData: [],
              narrativeText: [],
            },
          },
          planId: null,
          isExisting: false,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: "Có lỗi xảy ra khi kiểm tra hoặc tạo learning path" + error,
      };
    }
  }

  // ===== CONFIGURATION METHODS =====

  /**
   * Cập nhật cấu hình API
   */
  updateConfig(newConfig: Partial<LearningPathApiConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Lấy cấu hình hiện tại
   */
  getConfig(): LearningPathApiConfig {
    return { ...this.config };
  }

  /**
   * Kiểm tra kết nối API
   */
  async checkConnection(): Promise<ApiResponse<boolean>> {
    try {
      const response = await axios.get(this.getFullUrl("/getAll"), {
        timeout: 5000,
      });

      return {
        success: true,
        data: response.status === 200,
      };
    } catch (error) {
      return {
        success: false,
        error: "Không thể kết nối đến API server" + error,
        data: false,
      };
    }
  }
}

// Export singleton instance
const improvedLearningPathApi = new ImprovedLearningPathApi();
export default improvedLearningPathApi;

// Export class for custom instances if needed
export { ImprovedLearningPathApi };
