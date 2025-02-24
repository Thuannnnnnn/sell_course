import axios from 'axios';
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
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error adding content:', error);
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
