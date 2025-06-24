import axios from "axios";
import { Docs } from "app/types/doc";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const createDocument = async (
  title: string,
  file: File,
  contentsId: string,
  token: string
): Promise<Docs> => {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("file", file);
  formData.append("contentsId", contentsId);

  try {
    const response = await axios.post(
      `${API_URL}/api/admin/docs/create_docs`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data as Docs;
  } catch {
    throw new Error("Failed to create document");
  }
};

export const getDocumentById = async (contentId: string): Promise<Docs> => {
  try {
    const response = await axios.get(
      `${API_URL}/api/docs/view_doc/${contentId}`
    );
    return response.data as Docs;
  } catch {
    throw new Error("Failed to load document");
  }
};

export const updateDocument = async (
  docsId: string,
  title: string,
  file?: File,
  token?: string,
  contentsId?: string
): Promise<Docs> => {
  const formData = new FormData();
  formData.append("title", title);
  if (file) {
    formData.append("file", file);
  }
  formData.append("contentsId", contentsId || "");

  try {
    const response = await axios.put(
      `${API_URL}/api/admin/docs/update_docs/${docsId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data as Docs;
  } catch {
    throw new Error("Failed to update document");
  }
};

export const deleteDocument = async (
  docsId: string,
  token: string
): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/api/admin/docs/delete_doc/${docsId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new Error("Failed to delete document");
  }
};
