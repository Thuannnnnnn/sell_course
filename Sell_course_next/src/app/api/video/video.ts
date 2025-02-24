// services/videoApi.js
import axios from 'axios';


export const uploadVideo = async (file: File, contentId: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('contentId', contentId);

  await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/videos/upload/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateVideo = async (videoId: string, contentId: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/videos/update/${videoId}/${contentId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteVideo = async (videoId: string) => {
  await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/videos/delete/${videoId}`);
};
