// services/videoApi.js
import { VideoResponse } from "@/app/type/video/video";
import axios from "axios";

export const uploadVideo = async (
  file: File,
  contentId: string,
  title: string,
  token: string
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("contentId", contentId);
  formData.append("title", title);

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/video/create_video`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data", // ✅ Đặt đúng Content-Type
        },
      }
    );
    console.log("Upload success:", response.data);
    return response.data;
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
};
export const updateScript = async (
  file: File,
  videoId: string,
  token: string
) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/video/update_script/${videoId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    console.log("Upload success:", response.data);
    return response.data;
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
};

export const updateVideo = async (
  videoId: string,
  file: File,
  token: string
) => {
  const formData = new FormData();
  formData.append("file", file);

  await axios.put(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/video/update_video/${videoId}`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export const deleteVideo = async (videoId: string, token: string) => {
  await axios.delete(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/video/delete_video/${videoId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );
};
export const deleteScript = async (videoId: string, token: string) => {
  await axios.delete(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/video/delete_script/${videoId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
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
