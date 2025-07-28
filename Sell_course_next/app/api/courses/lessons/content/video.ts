import { VideoState } from "@/app/types/Course/Lesson/content/video";
import axios from "axios";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

export const getVideoById = async (
  videoId: string,
  accessToken: string
): Promise<VideoState> => {
  try {
    const response = await axios.get<VideoState>(
      `${API_BASE_URL}/video/view_video/${videoId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to fetch video");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

export const getVideoByContentId = async (
  contentId: string,
  accessToken: string
): Promise<VideoState> => {
  try {
    const response = await axios.get<VideoState>(
      `${API_BASE_URL}/video/view_video_content/${contentId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to fetch video");
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

export const getAllVideos = async (
  accessToken: string
): Promise<VideoState[]> => {
  const response = await axios.get<VideoState[]>(
    `${API_BASE_URL}/instructor/video/view_video_list`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return response.data;
};
