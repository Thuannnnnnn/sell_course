import { Document } from "@/app/type/document/Document";
import axios from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}`;

const getAuthHeaders = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const fetchDocs = async (): Promise<Document[]> => {
  try {
    const response = await axios.get<Document[]>(`${API_URL}/api/docs/getAll`);
    return response.data.map((doc) => ({
      ...doc,
    }));
  } catch (error) {
    handleAxiosError(error, "fetching documents");
    throw error;
  }
};

export const fetchDocsAdmin = async (token: string): Promise<Document[]> => {
  try {
    const response = await axios.get<Document[]>(
      `${API_URL}/view_docs`,
      getAuthHeaders(token)
    );
    return response.data.map((doc) => ({
      ...doc,
    }));
  } catch (error) {
    handleAxiosError(error, "fetching documents for admin");
    throw error;
  }
};

export const fetchDocById = async (
  contensId: string,
  token: string
): Promise<Document> => {
  try {
    const response = await axios.get<Document>(
      `${API_URL}/api/docs/view_doc/${contensId}`,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error, `fetching document with ID:(Admin)`);
    throw error;
  }
};

export const fetchDocByIdAdmin = async (
  contensId: string,
  token: string
): Promise<Document> => {
  try {
    const response = await axios.get<Document>(
      `${API_URL}/api/admin/docs/view_doc/${contensId}`,
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error, `fetching document with ID:(Admin)`);
    throw error;
  }
};

export const createDoc = async (
  title: string,
  contentsId: string,
  file: File,
  token: string
): Promise<number> => {
  try {
    const response = await axios.post<Document>(
      `${API_URL}/api/admin/docs/create_docs`,
      { title, contentsId, file },
      {
        headers: {
          ...getAuthHeaders(token).headers,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.status;
  } catch (error) {
    handleAxiosError(error, "creating document");
    throw error;
  }
};

export const updateDoc = async (
  docsId: string,
  title: string,
  file: File,
  contentsId: string,
  token: string
): Promise<number> => {
  try {
    const response = await axios.put<Document>(
      `${API_URL}/api/admin/docs/update_docs/${docsId}`,
      { title, file, contentsId },
      {
        ...getAuthHeaders(token),
        headers: {
          ...getAuthHeaders(token).headers,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.status;
  } catch (error) {
    handleAxiosError(error, `updating document with ID`);
    throw error;
  }
};

export const deleteDoc = async (
  docId: string,
  token: string
): Promise<number> => {
  try {
    const doc = await axios.delete(
      `${API_URL}/api/admin/docs/delete_doc/${docId}`,
      getAuthHeaders(token)
    );
    return doc.status;
  } catch (error) {
    handleAxiosError(error, `deleting document with ID: ${docId}`);
    throw error;
  }
};

const handleAxiosError = (error: unknown, context: string) => {
  if (axios.isAxiosError(error)) {
    console.error(
      `Axios error ${context}:`,
      error.response?.data || error.message
    );
  } else {
    console.error(`Unexpected error ${context}:`, error);
  }
};
