import axios from "axios";
import {
  ApiResponse,
  CreateForumDto,
  Forum,
  Reaction,
  ReactionType,
} from "@/app/type/forum/forum";

export async function getAllForum(): Promise<Forum[]> {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/forum/get_all_forum`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getForumById(forumId: string): Promise<Forum | null> {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/forum/get_forum/${forumId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch {
    try {
      const allForumsResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/forum/get_all_forum`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const allForums = allForumsResponse.data;
      const foundForum = allForums.find(
        (forum: Forum) => forum.forumId === forumId
      );

      return foundForum || null;
    } catch{
      return null;
    }
  }
}

export async function createForum(
  forumData: CreateForumDto,
  token: string
): Promise<Forum | null> {
  try {
    const formData = new FormData();
    formData.append("userId", forumData.userId);
    formData.append("title", forumData.title);
    formData.append("text", forumData.text);

    if (forumData.image) {
      formData.append("image", forumData.image);
    }

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/forum/create_forum`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch {
    return null;
  }
}

export async function updateForum(
  forumId: string,
  forumData: CreateForumDto,
  token: string
): Promise<Forum | null> {
  try {
    const formData = new FormData();
    formData.append("userId", forumData.userId);
    formData.append("title", forumData.title);
    formData.append("text", forumData.text);

    if (forumData.image) {
      formData.append("image", forumData.image);
    }

    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/forum/update_forum/${forumId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch {
    return null;
  }
}

export async function deleteForum(
  forumId: string,
  token: string
): Promise<boolean> {
  try {
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/forum/delete_forum/${forumId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.status === 200;
  } catch {
    return false;
  }
}

export const addReactionToTopic = async (
  token: string,
  userId: string,
  forumId: string,
  reactionType: ReactionType
): Promise<ApiResponse<Reaction>> => {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/reaction-topic`;
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, forumId, reactionType }),
    });

    const responseData = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error:
          responseData.message ||
          `Failed to add reaction. Status: ${response.status}`,
      };
    }

    const processedData: Reaction = {
      ...responseData,
      userId: responseData.userId || userId,
    };

    return { success: true, data: processedData };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return { success: false, error: `Error adding reaction: ${errorMessage}` };
  }
};

export const deleteReactionFromTopic = async (
  token: string,
  userId: string,
  forumId: string
): Promise<ApiResponse<void>> => {
  try {
    const deleteUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/reaction-topic/${userId}/${forumId}`;
    const response = await fetch(deleteUrl, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status !== 204) {
      const responseData = await response.json();
      return {
        success: false,
        error:
          responseData.message ||
          `Failed to delete reaction. Status: ${response.status}`,
      };
    }

    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return {
      success: false,
      error: `Error deleting reaction: ${errorMessage}`,
    };
  }
};

export const getReactionsByTopic = async (
  token: string,
  forumId: string
): Promise<ApiResponse<Reaction[]>> => {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/reaction-topic/${forumId}`;
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const responseData = await response.json();
      return {
        success: false,
        error:
          responseData.message ||
          `Failed to fetch reactions. Status: ${response.status}`,
      };
    }

    const data = await response.json();

    const processedData = Array.isArray(data)
      ? data.map((reaction) => ({
          ...reaction,
          userId: reaction.userId || reaction.user?.user_id || "",
        }))
      : [];

    return { success: true, data: processedData as Reaction[] };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return {
      success: false,
      error: `Error fetching reactions: ${errorMessage}`,
    };
  }
};