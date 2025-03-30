import axios from "axios";

export const recommend = async (userId: string) => {
  try {
    const response = await axios.post(
      `http://127.0.0.1:8000/recommend`,
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
