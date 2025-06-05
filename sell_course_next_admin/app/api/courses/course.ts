// lib/api/course.ts

import { Course } from "app/course/page";
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

export const fetchCourses = async (): Promise<Course[]> => {
  try {
    const response = await axios.get<Course[]>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/courses/getAll`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw error;
  }
};

export const deleteCourse = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/courses/${id}`);
  } catch (error) {
    console.error("Error deleting course:", error);
    throw error;
  }
};
