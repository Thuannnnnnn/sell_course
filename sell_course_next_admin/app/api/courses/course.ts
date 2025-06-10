import { Course } from "app/types/course";
import axios from "axios";

export const createCourse = async (
  formData: FormData,
  token: string
): Promise<Course> => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/instructor/courses/create_course`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Axios error creating course:",
        error.response?.data || error.message
      );
    } else {
      console.error("Unexpected error creating course:", error);
    }
    throw error;
  }
};

export const updateCourse = async (
  courseid: string,
  formData: FormData,
  token: string
): Promise<Course> => {
  try {
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}/api/instructor/courses/update_course/${courseid}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Axios error creating course:",
        error.response?.data || error.message
      );
    } else {
      console.error("Unexpected error creating course:", error);
    }
    throw error;
  }
};

export const fetchCourses = async (token: string): Promise<Course[]> => {
  try {
    const response = await axios.get<Course[]>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/instructor/courses/view_course`,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw error;
  }
};

export const fetchCourseById = async (
  token: string,
  courseId: string
): Promise<Course> => {
  try {
    const response = await axios.get<Course>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/instructor/courses/view_course/${courseId}`,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw error;
  }
};

export const deleteCourse = async (
  id: string,
  token: string
): Promise<void> => {
  try {
    await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/instructor/courses/delete_course/${id}`, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    throw error;
  }
};
