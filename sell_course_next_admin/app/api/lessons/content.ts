import { Content, CreateContentRequest, UpdateContentRequest, UpdateContentOrderRequest } from "../../types/lesson";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Fetch contents by lesson ID
export async function fetchContentsByLesson(lessonId: string, accessToken: string): Promise<Content[]> {
  const response = await fetch(`${API_BASE_URL}/api/admin/content/view_content/${lessonId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch contents for this lesson");
  }

  return response.json();
}

// Create a new content
export async function createContent(data: CreateContentRequest, accessToken: string): Promise<Content> {
  const response = await fetch(`${API_BASE_URL}/api/admin/content/create_content`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create content");
  }

  return response.json();
}

// Update a content
export async function updateContent(contentId: string, data: UpdateContentRequest, accessToken: string): Promise<Content> {
  const response = await fetch(`${API_BASE_URL}/api/admin/content/update_content/${contentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update content");
  }

  return response.json();
}

// Update content order
export async function updateContentOrder(data: UpdateContentOrderRequest, accessToken: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/admin/content/update_order`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update content order");
  }

  return response.json();
}

// Delete a content
export async function deleteContent(contentId: string, accessToken: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/admin/content/delete_content/${contentId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to delete content");
  }

  return response.json();
} 