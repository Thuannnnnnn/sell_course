import axios from "axios";
import { CourseData } from "@/app/type/course/Lesson";
interface LessonOrder {
  lessonId: string;
  order: number;
}

interface UpdateLessonOrderResponse {
  message: string;
}
export async function fetchLessonAdmin(
  courseId: string,
  token: string
): Promise<CourseData | null> {
  try {
    const response = await axios.get<CourseData>(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/lesson/view_lesson/${courseId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching lesson:", error);
    return null;
  }
}
export async function fetchLesson(
  courseId: string,
  token: string
): Promise<CourseData | null> {
  try {
    const response = await axios.get<CourseData>(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/lesson/view_lesson/${courseId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching lesson:", error);
    return null;
  }
}

export async function addLesson(
  lessonName: string,
  courseId: string,
  token: string
) {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/lesson/create_lesson`,
      {
        lessonName,
        courseId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding lesson:", error);
    return null;
  }
}
export const updateLesson = async (
  lessonId: string,
  lessonName: string,
  token: string
) => {
  try {
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/lesson/update_lesson/${lessonId}`,
      { lessonName },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating lesson:", error);
    return null;
  }
};

export const deleteLesson = async (lessonId: string, token: string) => {
  try {
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/lesson/delete_lesson/${lessonId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting lesson:", error);
    return null;
  }
};
export const updateLessonOrder = async (
  lessons: LessonOrder[],
  token: string
): Promise<UpdateLessonOrderResponse> => {
  try {
    const response = await axios.put<UpdateLessonOrderResponse>(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/lesson/update_order`,
      { lessons },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating lesson order:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || "Failed to update lesson order"
      );
    }
    throw new Error("An unknown error occurred while updating lesson order");
  }
};
