import axios from "axios";
import { Course } from "@/app/type/course/Course";

const API_BASE_URL = "http://localhost:8080/api";

const getAuthHeaders = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const fetchCourses = async (): Promise<Course[]> => {
  try {
    const response = await axios.get<Course[]>(
      `${API_BASE_URL}/courses/getAll`
    );
    return response.data.map((course) => ({
      ...course,
      updatedAt: new Date(course.updatedAt).toISOString(),
      createdAt: new Date(course.createdAt).toISOString(),
    }));
  } catch (error) {
    handleAxiosError(error, "fetching courses");
    throw error;
  }
};
export const fetchCoursesAdmin = async (token: string): Promise<Course[]> => {
  try {
    const response = await axios.get<Course[]>(
      `${API_BASE_URL}/admin/courses/view_course`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.map((course) => ({
      ...course,
      updatedAt: new Date(course.updatedAt).toISOString(),
      createdAt: new Date(course.createdAt).toISOString(),
    }));
  } catch (error) {
    handleAxiosError(error, "fetching courses");
    throw error;
  }
};

export const fetchCourseById = async (courseId: string): Promise<Course> => {
  try {
    const response = await axios.get<Course>(
      `${API_BASE_URL}/courses/getByCourse/${courseId}`
    );
    return {
      ...response.data,
      updatedAt: new Date(response.data.updatedAt).toISOString(),
      createdAt: new Date(response.data.createdAt).toISOString(),
    };
  } catch (error) {
    handleAxiosError(error, `fetching course with ID: ${courseId}`);
    throw error;
  }
};

export const fetchCourseByIdAdmin = async (
  courseId: string,
  token: string
): Promise<Course> => {
  try {
    const response = await axios.get<Course>(
      `${API_BASE_URL}/admin/courses/view_course/${courseId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return {
      ...response.data,
      updatedAt: new Date(response.data.updatedAt).toISOString(),
      createdAt: new Date(response.data.createdAt).toISOString(),
    };
  } catch (error) {
    handleAxiosError(error, `fetching course with ID: ${courseId}`);
    throw error;
  }
};

export const createCourse = async (
  courseData: Partial<Course>,
  files: { videoInfo?: File; imageInfo?: File },
  token: string
): Promise<Course> => {
  try {
    const formData = new FormData();
    Object.entries(courseData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value as string);
      }
    });

    if (files.videoInfo) formData.append("videoInfo", files.videoInfo);
    if (files.imageInfo) formData.append("imageInfo", files.imageInfo);

    const response = await axios.post<Course>(
      `${API_BASE_URL}/admin/courses/create_course`,
      formData,
      {
        ...getAuthHeaders(token),
        headers: {
          ...getAuthHeaders(token).headers,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    handleAxiosError(error, "creating course");
    throw error;
  }
};

export const updateCourse = async (
  courseId: string,
  updateData: Partial<Course>,
  files: { videoInfo?: File; imageInfo?: File },
  token: string
): Promise<Course> => {
  try {
    const formData = new FormData();
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value as string);
      }
    });

    if (files.videoInfo) formData.append("videoInfo", files.videoInfo);
    if (files.imageInfo) formData.append("imageInfo", files.imageInfo);

    const response = await axios.put<Course>(
      `${API_BASE_URL}/admin/courses/update_course/${courseId}`,
      formData,
      {
        ...getAuthHeaders(token),
        headers: {
          ...getAuthHeaders(token).headers,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    handleAxiosError(error, `updating course with ID: ${courseId}`);
    throw error;
  }
};

export const deleteCourse = async (
  courseId: string,
  token: string
): Promise<void> => {
  try {
    await axios.delete(
      `${API_BASE_URL}/admin/courses/delete_course/${courseId}`,
      getAuthHeaders(token)
    );
  } catch (error) {
    handleAxiosError(error, `deleting course with ID: ${courseId}`);
    throw error;
  }
};

const handleAxiosError = (error: unknown, context: string) => {
  if (axios.isAxiosError(error)) {
    console.error(
      `Axios error ${context}:`,
      error.response?.data || error.message
    );
  } else {
    console.error(`Unexpected error ${context}:`, error);
  }
};
