// services/videoApi.js
import { VideoResponse } from "@/app/type/video/video";
import axios from "axios";

export const uploadVideo = async (file: File, contentId: string) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("contentId", contentId);

  await axios.post(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/video/create_video`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
};

export const updateVideo = async (
  videoId: string,
  contentId: string,
  file: File
) => {
  const formData = new FormData();
  formData.append("file", file);

  await axios.put(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/video/update_video/${videoId}/${contentId}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
};

export const deleteVideo = async (videoId: string) => {
  await axios.delete(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/video/delete_video/${videoId}`
  );
};

export const getVideo = async (
  contentId: string,
  token: string
): Promise<VideoResponse> => {
  try {
    const response = await axios.get<VideoResponse>(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/video/view_video/${contentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("fetch video failed", error);
    throw error;
  }
};
