import { UserProfile } from '../../types/editProfile';
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getUserById = async (token: string): Promise<UserProfile> => {
  try {
    const response = await axios.get<UserProfile>(`${API_URL}/api/users/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch {
    throw new Error("Failed to fetch user data");
  }
};

