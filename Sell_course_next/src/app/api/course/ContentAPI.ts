import axios from "axios";
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
