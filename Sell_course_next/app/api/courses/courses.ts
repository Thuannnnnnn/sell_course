import { CourseResponseDTO, CourseRequestDTO } from "@/app/types/Course/Course";

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

// Course API functions
export const courseApi = {
  // Get all courses (public endpoint)
  getAllCourses: async (): Promise<CourseResponseDTO[]> => {
    return apiCall<CourseResponseDTO[]>("/api/courses/getAll");
  },

  // Get course by ID (public endpoint)
  getCourseById: async (courseId: string): Promise<CourseResponseDTO> => {
    return apiCall<CourseResponseDTO>(`/api/courses/getByCourse/${courseId}`);
  },

  // Get courses by category (public endpoint)
  getCoursesByCategory: async (categoryId: string): Promise<CourseResponseDTO[]> => {
    return apiCall<CourseResponseDTO[]>(`/api/getByCategory/${categoryId}`);
  },

  // Admin endpoints (require authentication)
  admin: {
    // Get all courses (admin)
    getAllCourses: async (token: string): Promise<CourseResponseDTO[]> => {
      return apiCall<CourseResponseDTO[]>("/api/admin/courses/view_course", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },

    // Get course by ID (admin)
    getCourseById: async (
      courseId: string,
      token: string
    ): Promise<CourseResponseDTO> => {
      return apiCall<CourseResponseDTO>(
        `/api/admin/courses/view_course/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    },

    // Update course
    updateCourse: async (
      courseId: string,
      updateData: Partial<CourseRequestDTO>,
      token: string,
      files?: {
        videoInfo?: File;
        imageInfo?: File;
      }
    ): Promise<CourseResponseDTO> => {
      const formData = new FormData();
      // Add course data to FormData
      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Add files if provided
      if (files?.videoInfo) {
        formData.append("videoInfo", files.videoInfo);
      }
      if (files?.imageInfo) {
        formData.append("imageInfo", files.imageInfo);
      }

      return apiCall<CourseResponseDTO>(
        `/api/admin/courses/update_course/${courseId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            // Don't set Content-Type for FormData, let browser set it
          },
          body: formData,
        }
      );
    },

    // Delete course
    deleteCourse: async (courseId: string, token: string): Promise<void> => {
      return apiCall<void>(`/api/admin/courses/delete_course/${courseId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
  },

  // Instructor endpoints
  instructor: {
    // Create course
    createCourse: async (
      courseData: CourseRequestDTO,
      files?: {
        videoIntro?: File;
        thumbnail?: File;
      }
    ): Promise<CourseResponseDTO> => {
      const formData = new FormData();

      // Add course data to FormData
      Object.entries(courseData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Add files if provided
      if (files?.videoIntro) {
        formData.append("videoIntro", files.videoIntro);
      }
      if (files?.thumbnail) {
        formData.append("thumbnail", files.thumbnail);
      }

      return apiCall<CourseResponseDTO>(
        "/api/instructor/courses/create_course",
        {
          method: "POST",
          // Don't set Content-Type for FormData, let browser set it
          body: formData,
        }
      );
    },
  },
};

export default courseApi;
