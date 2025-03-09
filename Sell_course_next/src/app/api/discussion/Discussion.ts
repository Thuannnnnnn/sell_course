import axios from "axios";
import {
  Discussion,
  CreateDiscussionDto,
  UpdateDiscussionDto,
} from "@/app/type/forum/forum";

// Tạo discussion
export async function createDiscussion(
  createDiscussionDto: CreateDiscussionDto,
  token: string
): Promise<Discussion | undefined> {
  console.log("API: Creating discussion with data:", createDiscussionDto);

  try {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/discussion`;
    console.log(`API: POST request to ${url}`);

    const response = await axios.post(url, createDiscussionDto, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("API: Discussion created successfully:", response.data);
    return response.data as Discussion;
  } catch (error) {
    console.error("API: Error creating discussion:", error);
    if (axios.isAxiosError(error)) {
      console.error("API: Response data:", error.response?.data);
      console.error("API: Response status:", error.response?.status);
    }
    return undefined;
  }
}

// Lấy danh sách discussion theo forumId
export async function getDiscussionsByForumId(
  forumId: string,
  token: string,
  userId?: string
): Promise<Discussion[] | undefined> {
  console.log(
    `API: Getting discussions for forumId: ${forumId}, userId: ${
      userId || "not provided"
    }`
  );

  try {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/discussion/forum/${forumId}`;
    console.log(`API: GET request to ${url}`);

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(`API: Retrieved ${response.data?.length || 0} discussions`);
    return response.data as Discussion[];
  } catch (error) {
    console.error("API: Error fetching discussions by forum ID:", error);
    if (axios.isAxiosError(error)) {
      console.error("API: Response data:", error.response?.data);
      console.error("API: Response status:", error.response?.status);
    }
    return undefined;
  }
}

// Xóa discussion
export async function deleteDiscussion(
  discussionId: string,
  token: string,
  userId?: string
): Promise<boolean> {
  console.log(
    `API: Deleting discussion with id: ${discussionId}, userId: ${
      userId || "not provided"
    }`
  );

  try {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/discussion/${discussionId}`;
    console.log(`API: DELETE request to ${url}`);

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };
    if (userId) headers["User-Id"] = userId;

    const response = await axios.delete(url, { headers });

    const success = response.status === 200;
    console.log(
      `API: Delete discussion result: ${
        success ? "success" : "failed"
      }, status: ${response.status}`
    );
    return success;
  } catch (error) {
    console.error("API: Error deleting discussion:", error);
    if (axios.isAxiosError(error)) {
      console.error("API: Response data:", error.response?.data);
      console.error("API: Response status:", error.response?.status);
    }
    return false;
  }
}

// Cập nhật discussion
export async function updateDiscussion(
  discussionId: string,
  updateDiscussionDto: UpdateDiscussionDto,
  token: string,
  userId?: string
): Promise<Discussion | undefined> {
  console.log(
    `API: Updating discussion with id: ${discussionId}, userId: ${
      userId || "not provided"
    }`
  );
  console.log("API: Update data:", updateDiscussionDto);

  try {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/discussion/${discussionId}`;
    console.log(`API: PUT request to ${url}`);

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };
    if (userId) headers["User-Id"] = userId;

    const response = await axios.patch(url, updateDiscussionDto, { headers });

    console.log("API: Discussion updated successfully:", response.data);
    return response.data as Discussion;
  } catch (error) {
    console.error("API: Error updating discussion:", error);
    if (axios.isAxiosError(error)) {
      console.error("API: Response data:", error.response?.data);
      console.error("API: Response status:", error.response?.status);
    }
    return undefined;
  }
}

// Lấy discussion theo ID
export async function getDiscussionById(
  discussionId: string,
  token: string,
  userId?: string
): Promise<Discussion | undefined> {
  try {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/discussion/${discussionId}`;
    console.log(`API: GET request to ${url}`);

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };
    if (userId) headers["User-Id"] = userId;

    const response = await axios.get(url, { headers });

    console.log("API: Retrieved discussion:", response.data);
    return response.data as Discussion;
  } catch (error) {
    console.error("API: Error fetching discussion by ID:", error);
    if (axios.isAxiosError(error)) {
      console.error("API: Response data:", error.response?.data);
      console.error("API: Response status:", error.response?.status);
    }
    return undefined;
  }
}
