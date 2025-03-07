import axios from "axios";

export interface User {
  user_id: string;
  email: string;
  username: string;
  password: string;
  avatarImg: string;
  gender: string;
  birthDay: string;
  phoneNumber: string;
  role: string;
  isOAuth: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReactionTopic {
  reactionId: string;
  reactionType: string;
  createdAt: string;
}

export interface Discussion {
  discussionId: string;
  content: string;
  createdAt: string;
}

export interface Forum {
  forumId: string;
  title: string;
  image: string;
  text: string;
  createdAt: string;
  user: User;
  reactionTopics: ReactionTopic[];
  discussions: Discussion[];
}

export interface CreateForumDto {
  userId: string;
  title: string;
  text: string;
  image?: File | null;
}

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
    console.error("Error fetching forum data:", error);
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
  } catch (error) {
    console.error("Error fetching forum by ID:", error);
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
    } catch (backupError) {
      console.error("Error in backup method:", backupError);
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
  } catch (error) {
    console.error("Error creating forum:", error);
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
  } catch (error) {
    console.error("Error updating forum:", error);
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
  } catch (error) {
    console.error("Error deleting forum:", error);
    return false;
  }
}

export async function ReactionTopic(
  userId: string,
  forumId: string,
  reactionType: string,
  token: string
): Promise<boolean> {
  try {
    // Create the payload exactly as expected by the API
    const payload = {
      userId: userId,
      forumId: forumId,
      reactionType: reactionType,
    };

    console.log("Sending reaction data:", payload);

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/reaction-topic`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Reaction response:", response.status, response.data);
    return response.status === 200 || response.status === 201;
  } catch (error) {
    console.error("Error reaction topic:", error);
    return false;
  }
}

export async function ReactionTopicById(
  userId: string,
  forumId: string,
  reactionType: string,
  token: string
): Promise<any> {
  try {
    console.log(`Fetching reaction for userId: ${userId}, forumId: ${forumId}`);

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/reaction-topic/${forumId}`,
      {
        params: {
          userId: userId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Reaction data received:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error getting reaction topic:", error);
    return null;
  }
}

export async function DeteleReactionTopic(
  userId: string,
  forumId: string,
  reactionType: string,
  token: string
): Promise<any> {
  try {
    console.log(`Fetching reaction for userId: ${userId}, forumId: ${forumId}`);

    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/reaction-topic/${userId}/${forumId}`,
      {
        params: {
          userId: userId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Reaction data received:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error getting reaction topic:", error);
    return null;
  }
}
