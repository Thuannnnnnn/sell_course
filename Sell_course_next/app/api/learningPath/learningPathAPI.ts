import {
  ApiResponse,
  LearningPathAnswers,
  LearningPathData,
} from "@/app/types/learningPath/learningPath";
import axios from "axios";

class LearningPathApi {
  private baseURL: string;
  private n8nWebhookURL: string;

  constructor() {
    // Thay đổi URL này theo API backend của bạn
    this.baseURL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

    // n8n webhook URL for learning path generation
    this.n8nWebhookURL =
      "https://n8n.coursemaster.io.vn/webhook/generate-learning-path";
  }

  /**
   * Tạo learning path dựa trên câu trả lời của người dùng thông qua n8n webhook
   */
  async createLearningPath(
    answers: LearningPathAnswers
  ): Promise<ApiResponse<LearningPathData>> {
    try {
      // Transform answers to the new format expected by n8n
      const n8nPayload = this.transformToN8nFormat(answers);

      const response = await axios.post(this.n8nWebhookURL, n8nPayload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const transformedData = this.transformFromN8nResponse(response.data);

      return {
        success: true,
        data: transformedData,
      };
    } catch (error) {
      console.error("Error creating learning path via n8n:", error);
      return {
        success: false,
      };
    }
  }

  /**
   * Transform frontend answers to n8n expected format
   */
  private transformToN8nFormat(answers: LearningPathAnswers) {
    const timeMap: Record<
      LearningPathAnswers["answers"]["time_availability"],
      number
    > = {
      "Dưới 30 phút": 0.5,
      "30-60 phút": 1,
      "1-2 giờ": 1.5,
      "2-3 giờ": 2.5,
      "Trên 3 giờ": 4,
    };

    const dayMap: Record<string, number> = {
      "Chủ nhật": 0,
      "Thứ 2": 1,
      "Thứ 3": 2,
      "Thứ 4": 3,
      "Thứ 5": 4,
      "Thứ 6": 5,
      "Thứ 7": 6,
    };

    const timeSlotMap: Record<
      LearningPathAnswers["answers"]["preferred_time"],
      string
    > = {
      "Sáng sớm (6:00-9:00)": "07:00",
      "Buổi sáng (9:00-12:00)": "09:00",
      "Buổi chiều (12:00-17:00)": "14:00",
      "Buổi tối (17:00-21:00)": "18:00",
      "Tối muộn (21:00-24:00)": "21:00",
    };

    const dailyHours = timeMap[answers.answers.time_availability];
    const preferredDays = answers.answers.preferred_days || [
      "Thứ 2",
      "Thứ 4",
      "Thứ 6",
    ];
    const studyHoursPerWeek = dailyHours * preferredDays.length;
    const startTime = timeSlotMap[answers.answers.preferred_time];

    const availableSlots = preferredDays.map((day) => ({
      day_of_week: dayMap[day] ?? 1,
      start_time: startTime,
      duration: Math.round(dailyHours * 60),
    }));

    const allDays = [0, 1, 2, 3, 4, 5, 6];
    const preferredDayNumbers = preferredDays.map((day) => dayMap[day]);
    const noStudyDays = allDays.filter(
      (day) => !preferredDayNumbers.includes(day)
    );

    return {
      userId: "temp-user-id",
      name: answers.answers.name,
      level: answers.answers.difficulty_preference,
      study_goal: answers.answers.learning_goal,
      study_hours_per_week: studyHoursPerWeek,
      total_weeks: 4,
      max_minutes_per_day: Math.round(dailyHours * 60),
      no_study_days: noStudyDays,
      experience: answers.answers.special_requirements,
      available_slots: availableSlots,
      course_ids: answers.courseId,
      start_date: new Date().toISOString().split("T")[0],
    };
  }

 
  private transformFromN8nResponse(n8nData: LearningPathData): LearningPathData {
    // Assuming n8n returns data in a specific format
    // You may need to adjust this based on actual n8n response structure
    return {
      scheduleItems: {
        scheduleData: n8nData.scheduleItems?.scheduleData || [],
        narrativeText: n8nData.scheduleItems?.narrativeText || [],
      },
    };
  }

  /**
   * Lưu learning path đã chỉnh sửa vào backend
   */
  async saveLearningPath(
    userId: string,
    courseId: string,
    data: LearningPathData,
    answers: LearningPathAnswers
  ): Promise<ApiResponse<any>> {
    try {
      // Transform LearningPathData to match backend DTO structure
      const createLearningPlanDto = this.transformToBackendDto(
        userId,
        courseId,
        data,
        answers
      );

      const response = await axios.post(
        `${this.baseURL}/learningPath`,
        createLearningPlanDto,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error saving learning path:", error);
      return {
        success: false,
      }
    }
  }

  /**
   * Transform LearningPathData to backend DTO format
   */
  private transformToBackendDto(
    userId: string,
    courseId: string,
    data: LearningPathData,
    answers: LearningPathAnswers
  ) {
    // Extract constraints from answers
    const constraints = [];

    // Add time availability constraint
    if (answers.answers.time_availability) {
      constraints.push({
        type: "time_availability",
        key: "daily_hours",
        value: answers.answers.time_availability,
      });
    }

    // Add preferred days constraint
    if (answers.answers.preferred_days) {
      answers.answers.preferred_days.forEach((day: string, index: number) => {
        constraints.push({
          type: "preferred_days",
          key: index.toString(),
          value: day,
        });
      });
    }

    // Add preferred time constraint
    if (answers.answers.preferred_time) {
      constraints.push({
        type: "preferred_time",
        key: "time_slot",
        value: answers.answers.preferred_time,
      });
    }

    // Extract preferences from answers
    const preferences = [];

    if (answers.answers.learning_style) {
      preferences.push({
        type: "learning_style",
        key: "style",
        value: answers.answers.learning_style,
      });
    }

    if (answers.answers.difficulty_preference) {
      preferences.push({
        type: "difficulty_preference",
        key: "level",
        value: answers.answers.difficulty_preference,
      });
    }

    if (answers.answers.special_requirements) {
      preferences.push({
        type: "special_requirements",
        key: "requirements",
        value: answers.answers.special_requirements,
      });
    }

    // Calculate total weeks from schedule data
    const totalWeeks = Math.max(
      ...data.scheduleItems.scheduleData.map((item) => item.weekNumber),
      1
    );

    return {
      userId,
      courseId,
      studyGoal: answers.answers.learning_goal || "Học tập hiệu quả",
      totalWeeks,
      constraints,
      preferences,
      narrativeTemplates: data.scheduleItems.narrativeText,
      scheduleItems: data.scheduleItems.scheduleData,
    };
  }

  /**
   * Lấy learning path theo ID
   */
  async getLearningPath(
    learningPathId: string
  ): Promise<ApiResponse<LearningPathData>> {
    try {
      const response = await axios.get(
        `${this.baseURL}/learningPath/getById/${learningPathId}`
      );

      // Transform backend response to frontend format
      const transformedData = this.transformFromBackendResponse(response.data);

      return {
        success: true,
        data: transformedData,
      };
    } catch (error: any) {
      console.error("Error fetching learning path:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Có lỗi xảy ra khi tải learning path",
      };
    }
  }

  /**
   * Lấy danh sách learning path của người dùng cho khóa học cụ thể
   */
  async getUserLearningPathsForCourse(
    userId: string,
    courseId: string
  ): Promise<ApiResponse<any[]>> {
    try {
      const response = await axios.get(
        `${this.baseURL}/learningPath/user/${userId}`
      );

      // Filter by course ID
      const coursePaths = response.data.filter(
        (plan: any) =>
          plan.courseId === courseId || plan.course?.courseId === courseId
      );

      return {
        success: true,
        data: coursePaths,
      };
    } catch (error: any) {
      console.error("Error fetching user learning paths:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Có lỗi xảy ra khi tải danh sách learning path",
      };
    }
  }

  /**
   * Transform backend response to frontend LearningPathData format
   */
  private transformFromBackendResponse(backendData: any): LearningPathData {
    return {
      scheduleItems: {
        scheduleData: backendData.scheduleItems?.scheduleData || [],
        narrativeText:
          backendData.scheduleItems?.narrativeText ||
          backendData.narrativeTemplates ||
          [],
      },
    };
  }

  /**
   * Cập nhật learning path đã chỉnh sửa
   */
  async updateLearningPath(
    learningPathId: string,
    data: LearningPathData
  ): Promise<ApiResponse<any>> {
    try {
      const response = await axios.put(
        `${this.baseURL}/learningPath/update/${learningPathId}`,
        {
          narrativeTemplates: data.scheduleItems.narrativeText,
          scheduleItems: data.scheduleItems.scheduleData,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("Error updating learning path:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Có lỗi xảy ra khi cập nhật learning path",
      };
    }
  }

  /**
   * Xóa learning path
   */
  async deleteLearningPath(learningPathId: string): Promise<ApiResponse<void>> {
    try {
      await axios.delete(
        `${this.baseURL}/learningPath/delete/${learningPathId}`
      );

      return {
        success: true,
      };
    } catch (error: any) {
      console.error("Error deleting learning path:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Có lỗi xảy ra khi xóa learning path",
      };
    }
  }
}

const learningPathApi = new LearningPathApi();
export default learningPathApi;
