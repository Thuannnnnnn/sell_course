import { Lesson, LessonsResponse } from "@/app/types/Course/Lesson/Lessons";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Fetch all lessons
export async function fetchLessons(accessToken: string): Promise<Lesson[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/instructor/lesson/view_lesson`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch lessons");
  }

  return response.json();
}

// Fetch lessons by course ID
export async function fetchLessonsByCourseId(
  courseId: string,
  accessToken: string
): Promise<LessonsResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/instructor/lesson/view_lesson/${courseId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || "Failed to fetch lessons for this course"
    );
  }

  return response.json();
}
