import axios, { type AxiosProgressEvent } from "axios";
import { VideoState } from "app/types/video";
import { ApiResponse } from "app/types/api-response";

const API_BASE_URL =`${process.env.NEXT_PUBLIC_API_URL}/api`;

export const createVideo = async (
  title: string,
  file: File,
  contentId: string,
  accessToken: string
): Promise<VideoState> => {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("contentId", contentId);
  formData.append("file", file);

  try {
    const response = await axios.post<VideoState>(
      `${API_BASE_URL}/instructor/video/create_video`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data", // Axios tự động đặt nếu dùng FormData
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to create video"
      );
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

export const createVideoWithProgress = async (
  title: string,
  file: File,
  contentId: string,
  accessToken: string,
  signal: AbortSignal,
  onProgress: (p: number) => void
): Promise<VideoState> => {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('contentId', contentId);
  formData.append('file', file);
  try {
    const response = await axios.post<VideoState>(
      `${API_BASE_URL}/instructor/video/create_video`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        signal,
        onUploadProgress: (evt: AxiosProgressEvent) => {
          if (evt.total) {
            const percent = (evt.loaded / evt.total) * 100;
            onProgress(percent);
          }
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to create video');
    }
    throw error;
  }
};

export const getVideoById = async (videoId: string): Promise<VideoState> => {
  try {
    const response = await axios.get<VideoState>(
      `${API_BASE_URL}/video/view_video/${videoId}`
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

export const updateVideoFile = async (
  videoId: string,
  file: File,
  accessToken: string
): Promise<ApiResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.put<ApiResponse>(
      `${API_BASE_URL}/instructor/video/update_video/${videoId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to update video file"
      );
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

export const updateVideoFileWithProgress = async (
  videoId: string,
  file: File,
  accessToken: string,
  signal: AbortSignal,
  onProgress: (p: number) => void
): Promise<ApiResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.put<ApiResponse>(
      `${API_BASE_URL}/instructor/video/update_video/${videoId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
        signal,
        onUploadProgress: (evt: AxiosProgressEvent) => {
          if (evt.total) {
            const percent = (evt.loaded / evt.total) * 100;
            onProgress(percent);
          }
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to update video file"
      );
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

export const updateVideoScript = async (
  videoId: string,
  file: File,
  accessToken: string
): Promise<ApiResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.put<ApiResponse>(
      `${API_BASE_URL}/instructor/video/update_script/${videoId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to update video script"
      );
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

export const updateVideoScriptWithProgress = async (
  videoId: string,
  file: File,
  accessToken: string,
  signal: AbortSignal,
  onProgress: (p: number) => void
): Promise<ApiResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.put<ApiResponse>(
      `${API_BASE_URL}/instructor/video/update_script/${videoId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
        signal,
        onUploadProgress: (evt: AxiosProgressEvent) => {
          if (evt.total) {
            const percent = (evt.loaded / evt.total) * 100;
            onProgress(percent);
          }
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to update video script"
      );
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

export const deleteVideo = async (
  videoId: string,
  accessToken: string
): Promise<ApiResponse> => {
  try {
    const response = await axios.delete<ApiResponse>(
      `${API_BASE_URL}/instructor/video/delete_video_script/${videoId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to delete video"
      );
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};
export const getAllVideos = async (accessToken: string): Promise<VideoState[]> => {
  try {
    const response = await axios.get<VideoState[]>(
      `${API_BASE_URL}/instructor/video/view_video_list`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch videos"
      );
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};
