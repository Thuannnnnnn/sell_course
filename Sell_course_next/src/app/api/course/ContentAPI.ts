import axios from "axios";
interface ContentOrder {
  contentId: string;
  order: number;
}

interface UpdateContentOrderResponse {
  message: string;
}
export async function addContent(
  lessonId: string,
  contentName: string,
  contentType: string,
  token: string
) {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/content/create_content/`,
      {
        lessonId,
        contentName,
        contentType,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding content:", error);
    return null;
  }
}
export const updateContent = async (
  contentId: string,
  contentName: string,
  token: string
) => {
  try {
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/content/update_content/${contentId}`,
      { contentName },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating content:", error);
    return null;
  }
};

export const deleteContent = async (contentId: string, token: string) => {
  try {
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/content/delete_content/${contentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting content:", error);
    return null;
  }
};
export const updateContentOrder = async (
  contents: ContentOrder[],
  token: string
): Promise<UpdateContentOrderResponse> => {
  try {
    const response = await axios.put<UpdateContentOrderResponse>(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/content/update_order`,
      { contents },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating content order:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || "Failed to update content order"
      );
    }
    throw new Error("An unknown error occurred while updating content order");
  }
};
