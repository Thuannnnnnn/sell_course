import axios from "axios";
import { Course } from "@/app/type/course/Course";

const API_BASE_URL = "http://localhost:8080/api/courses";

const getAuthHeaders = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const fetchCourses = async (token: string): Promise<Course[]> => {
  try {
    const response = await axios.get<Course[]>(`${API_BASE_URL}/getAll`, getAuthHeaders(token));
    console.log("Fetched courses:", response.data);
    return response.data;
  } catch (error) {
    handleAxiosError(error, "fetching courses");
    throw error;
  }
};

export const fetchCourseById = async (courseId: string, token: string): Promise<Course> => {
  try {
    const response = await axios.get<Course>(`${API_BASE_URL}/getByCourse/${courseId}`, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    handleAxiosError(error, `fetching course with ID: ${courseId}`);
    throw error;
  }
};

export const createCourse = async (courseData: Course, token: string): Promise<Course> => {
  try {
    const response = await axios.post<Course>(`${API_BASE_URL}/createCourse`, courseData, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    handleAxiosError(error, "creating course");
    throw error;
  }
};

export const updateCourse = async (courseId: string, courseData: Course, token: string): Promise<Course> => {
  try {
    const response = await axios.put<Course>(`${API_BASE_URL}/updateCourse/${courseId}`, courseData, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    handleAxiosError(error, `updating course with ID: ${courseId}`);
    throw error;
  }
};

export const deleteCourse = async (courseId: string, token: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/deleteCourse/${courseId}`, getAuthHeaders(token));
  } catch (error) {
    handleAxiosError(error, `deleting course with ID: ${courseId}`);
    throw error;
  }
};

const handleAxiosError = (error: unknown, context: string) => {
  if (axios.isAxiosError(error)) {
    console.error(`Axios error ${context}:`, error.response?.data || error.message);
  } else {
    console.error(`Unexpected error ${context}:`, error);
  }
};
