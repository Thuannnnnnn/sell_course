import {
  ContentData,
  ContentResponse,
} from "@/app/types/Course/Lesson/Lessons";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Fetch contents by lesson ID
export async function fetchContentsByLesson(
  lessonId: string,
  accessToken: string
): Promise<ContentData[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/content/view_contentOfLesson/${lessonId}`,
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
      errorData.message || "Failed to fetch contents for this lesson"
    );
  }

  const result = await response.json();

  return result;
}

export const fetchContentsByIds = async (
  contentIds: string[],
  accessToken: string
): Promise<ContentResponse[]> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/admin/contents/view_content`,
      contentIds,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
