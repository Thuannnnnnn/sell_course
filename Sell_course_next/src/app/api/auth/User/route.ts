import axios from "axios";

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
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (err: any) {
    throw err.response?.data?.message || "Failed to change password.";
  }
};

export const updateUserProfile = async (
  formData: FormData,
  token: string,
) => {
  try {
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/user`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Error updating profile.");
  }
};

export const fetchUserDetails = async (userId: string) => {
  if (!userId) return null;
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user details:", error);
    throw new Error("Failed to load user details. Please try again later.");
  }
};

