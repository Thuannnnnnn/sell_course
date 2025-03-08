import type { createDiscussion, Discussion } from "@/app/type/forum/forum";
import axios from "axios";

export async function createDiscussion(
  createDiscussionDto: createDiscussion,
  token: string
): Promise<Discussion | undefined> {
  console.log("API: Creating discussion with data:", createDiscussionDto);

  try {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/discussion`;
    console.log(`API: POST request to ${url}`);

    const response = await axios.post(
      url,
      createDiscussionDto,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("API: Discussion created successfully:", response.data);

    // Ensure the userId is preserved in the returned data
    const result = {
      ...response.data,
      userId: createDiscussionDto.userId // Ensure userId is preserved
    };

    return result;
  } catch (error) {
    console.error("API: Error creating discussion:", error);
    if (axios.isAxiosError(error)) {
      console.error("API: Response data:", error.response?.data);
      console.error("API: Response status:", error.response?.status);
    }
    return undefined;
  }
}

export async function getDiscussionsByForumId(
  forumId: string,
  token: string,
  userId?: string
): Promise<Discussion[] | undefined> {
  console.log(`API: Getting discussions for forumId: ${forumId}, userId: ${userId || 'not provided'}`);

  try {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/discussion/forum/${forumId}`;
    console.log(`API: GET request to ${url}`);

    const response = await axios.get(
      url,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(`API: Retrieved ${response.data?.length || 0} discussions`);

    // If userId is provided, ensure each discussion has the userId
    if (userId && response.data) {
      const processedData = response.data.map((discussion: Discussion) => ({
        ...discussion,
        userId: discussion.userId || userId
      }));

      console.log("API: Processed discussions with userId:", processedData);
      return processedData;
    }

    return response.data;
  } catch (error) {
    console.error("API: Error fetching discussions by forum ID:", error);
    if (axios.isAxiosError(error)) {
      console.error("API: Response data:", error.response?.data);
      console.error("API: Response status:", error.response?.status);
    }
    return undefined;
  }
}

export async function deleteDiscussion(
  discussionId: string,
  token: string,
  userId?: string
): Promise<boolean> {
  console.log(`API: Deleting discussion with id: ${discussionId}, userId: ${userId || 'not provided'}`);

  try {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/discussion/${discussionId}`;
    console.log(`API: DELETE request to ${url}`);

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };

    if (userId) {
      headers['User-Id'] = userId;
      console.log(`API: Including User-Id header: ${userId}`);
    }

    const response = await axios.delete(
      url,
      {
        headers,
      }
    );

    const success = response.status === 200;
    console.log(`API: Delete discussion result: ${success ? 'success' : 'failed'}, status: ${response.status}`);

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

export async function updateDiscussion(
  discussionId: string,
  updateDiscussionDto: Partial<Discussion>,
  token: string,
  userId?: string
): Promise<Discussion | undefined> {
  console.log(`API: Updating discussion with id: ${discussionId}, userId: ${userId || 'not provided'}`);
  console.log("API: Update data:", updateDiscussionDto);

  try {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/discussion/${discussionId}`;
    console.log(`API: PUT request to ${url}`);

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };

    if (userId) {
      headers['User-Id'] = userId;
      console.log(`API: Including User-Id header: ${userId}`);
    }

    const response = await axios.put(
      url,
      updateDiscussionDto,
      {
        headers,
      }
    );

    console.log("API: Discussion updated successfully:", response.data);

    // If userId is provided, ensure the returned discussion has the userId
    if (userId && response.data) {
      const result = {
        ...response.data,
        userId: response.data.userId || userId
      };

      console.log("API: Processed updated discussion with userId:", result);
      return result;
    }

    return response.data;
  } catch (error) {
    console.error("API: Error updating discussion:", error);
    if (axios.isAxiosError(error)) {
      console.error("API: Response data:", error.response?.data);
      console.error("API: Response status:", error.response?.status);
    }
    return undefined;
  }
}

export async function getDiscussionById(
  discussionId: string,
  token: string,
  userId?: string
): Promise<Discussion | undefined> {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/discussion/${discussionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          ...(userId && { 'User-Id': userId })
        },
      }
    );

    // If userId is provided, ensure the returned discussion has the userId
    if (userId && response.data) {
      return {
        ...response.data,
        userId: response.data.userId || userId
      };
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching discussion by ID:", error);
    return undefined;
  }
}
