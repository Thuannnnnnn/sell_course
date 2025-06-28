import { ContentResponse } from "@/app/types/Course/Lesson/Lessons";


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Fetch contents by lesson ID
export async function fetchContentsByLesson(
  lessonId: string,
  accessToken: string
): Promise<ContentResponse[]> {
  console.log("🌐 API: Fetching contents for lesson:", lessonId);

  const response = await fetch(
    `${API_BASE_URL}/api/admin/content/view_content/${lessonId}`,
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
    console.log("❌ API: Fetch contents failed:", {
      status: response.status,
      errorData,
    });
    throw new Error(
      errorData.message || "Failed to fetch contents for this lesson"
    );
  }

  const result = await response.json();
  console.log("✅ API: Contents fetched successfully:", {
    count: result.length,
    contents: result,
  });
  return result;
}
