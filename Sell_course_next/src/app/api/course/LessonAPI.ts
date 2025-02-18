import axios from "axios";
import { CourseData } from "@/app/type/course/Lesson";

export async function fetchLesson(
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
