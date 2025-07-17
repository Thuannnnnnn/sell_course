import { Lesson, CreateLessonRequest, UpdateLessonRequest, UpdateLessonOrderRequest } from "../../types/lesson";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Fetch all lessons
export async function fetchLessons(accessToken: string): Promise<Lesson[]> {
  const response = await fetch(`${API_BASE_URL}/api/instructor/lesson/view_lesson`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch lessons");
  }

  return response.json();
}

// Fetch lessons by course ID
export async function fetchLessonsByCourseId(courseId: string, accessToken: string): Promise<Lesson[]> {
  const response = await fetch(`${API_BASE_URL}/api/instructor/lesson/view_lesson/${courseId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch lessons for this course");
  }

  return response.json();
}

// Create a new lesson
export async function createLesson(data: CreateLessonRequest, accessToken: string): Promise<{ message: string; data: boolean }> {
  const response = await fetch(`${API_BASE_URL}/api/instructor/lesson/create_lesson`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create lesson");
  }

  return response.json();
}

// Update a lesson
export async function updateLesson(lessonId: string, data: UpdateLessonRequest, accessToken: string): Promise<Lesson> {
  const response = await fetch(`${API_BASE_URL}/api/instructor/lesson/update_lesson/${lessonId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update lesson");
  }

  return response.json();
}

// Update lesson order
export async function updateLessonOrder(data: UpdateLessonOrderRequest, accessToken: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/instructor/lesson/update_order`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update lesson order");
  }

  return response.json();
}

// Delete a lesson
export async function deleteLesson(lessonId: string, accessToken: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/instructor/lesson/delete_lesson/${lessonId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to delete lesson");
  }

  return response.json();
}