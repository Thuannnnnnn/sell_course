import axios from "axios";

export const changePassword = async (
  token: string,
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
) => {
  try {
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/change-password`,
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
  token: string,
  formData: FormData
) => {
  try {
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`,
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

