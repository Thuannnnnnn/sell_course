import axios from "axios";
import {
  Discussion,
  CreateDiscussionDto,
  UpdateDiscussionDto,
} from "@/app/type/forum/forum";

export async function createDiscussion(
  createDiscussionDto: CreateDiscussionDto,
  token: string
): Promise<Discussion | undefined> {
  try {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/discussion`;
    const response = await axios.post(url, createDiscussionDto, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data as Discussion;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return undefined;
    }
    return undefined;
  }
}

export async function getDiscussionsByForumId(
  forumId: string,
  token: string
): Promise<Discussion[] | undefined> {
  try {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/discussion/forum/${forumId}`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data as Discussion[];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return undefined;
    }
    return undefined;
  }
}

export async function deleteDiscussion(
  discussionId: string,
  token: string,
  userId?: string
): Promise<boolean> {
  try {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/discussion/${discussionId}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };
    if (userId) headers["User-Id"] = userId;

    const response = await axios.delete(url, { headers });
    return response.status === 200;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return false;
    }
    return false;
  }
}

export async function updateDiscussion(
  discussionId: string,
  updateDiscussionDto: UpdateDiscussionDto,
  token: string,
  userId?: string
): Promise<Discussion | undefined> {
  try {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/discussion/${discussionId}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };
    if (userId) headers["User-Id"] = userId;

    const response = await axios.patch(url, updateDiscussionDto, { headers });
    return response.data as Discussion;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return undefined;
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
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/discussion/${discussionId}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };
    if (userId) headers["User-Id"] = userId;

    const response = await axios.get(url, { headers });
    return response.data as Discussion;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return undefined;
    }
    return undefined;
  }
}
