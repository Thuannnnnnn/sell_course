import axios from "axios";

export const recommend = async (userId: string) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL}/recommend`,
      {
        user_id: userId,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating course purchase:", error);
    throw error;
  }
};
