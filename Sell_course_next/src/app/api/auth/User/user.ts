import { UserGetAllCoursePurchase } from '@/app/type/user/User';
import axios from 'axios';

export const changePassword = async (
  token: string,
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
) => {
  try {
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/user/change-password`,
      { currentPassword, newPassword, confirmPassword },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch {
    throw 'Failed to change password.';
  }
};

export const updateUserProfile = async (formData: FormData, token: string) => {
  try {
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/user`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    const user = response.data;
    return user;
  } catch {
    throw 'Error updating profile.';
  }
};

export const fetchUserDetails = async (token: string, email: string) => {
  if (!token || !email) return null;
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/user`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw new Error('Failed to load user details. Please try again later.');
  }
};

export const getUserId = async (token: string) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/profile`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const UserData = response.data.data;
    console.log('Data Backend:', UserData);
    const UserId = UserData.user_id;
    console.log(UserId);
    return UserId;
  } catch (error) {
    console.error('Error fetching user ID:', error);
  }
};

export const fetchCoursePurchased = async (
  token: string,
  email: string
): Promise<UserGetAllCoursePurchase[]> => {
  try {
    const response = await axios.get<UserGetAllCoursePurchase[]>(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/course_purchased`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error, `fetching course purchases for user ID: ${email}`);
    throw error;
  }
};

const handleAxiosError = (error: unknown, context: string) => {
  if (axios.isAxiosError(error)) {
    console.error(
      `Axios error in ${context}:`,
      error.response?.data || error.message
    );
  } else {
    console.error(`Unexpected error in ${context}:`, error);
  }
};
