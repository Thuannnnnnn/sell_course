import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

import {
  UpdateProfileRequest,
  UserProfile,
} from "@/app/types/profile/editProfile";
import { ChangePasswordRequest } from "@/app/types/auth/change-password/api";

export const getUserProfile = async (token: string): Promise<UserProfile> => {
  try {
    console.log("API URL:", API_URL);
    console.log(
      "Making request with token:",
      token ? "Token exists" : "No token"
    );

    const response = await axios.get<{
      status: number;
      message: string;
      data: UserProfile;
    }>(`${API_URL}/api/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Profile API response:", response.status);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
      });

      if (error.response?.status === 401) {
        throw new Error(
          "Authentication failed: Your session may have expired. Please log in again."
        );
      }
    }

    console.error("Profile API error:", error);
    throw new Error(
      `Failed to fetch user profile: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

// Get user by ID
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

// Update user profile
export const updateUserProfile = async (
  token: string,
  updateData: UpdateProfileRequest,
  avatarFile?: File
): Promise<UserProfile> => {
  try {
    const formData = new FormData();

    // Add updateData fields to formData
    if (updateData.username) formData.append("username", updateData.username);
    if (updateData.gender) formData.append("gender", updateData.gender);
    if (updateData.birthDay) formData.append("birthDay", updateData.birthDay);
    if (updateData.phoneNumber !== undefined)
      formData.append("phoneNumber", updateData.phoneNumber.toString());

    // Add avatar file if it exists
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    const response = await axios.put<UserProfile>(
      `${API_URL}/api/users/user`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Update profile error:", error);
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Failed to update user profile: ${
          error.response?.data?.message || error.message
        }`
      );
    }
    throw new Error("Failed to update user profile");
  }
};

// Change password
export const changePassword = async (
  token: string,
  passwordData: ChangePasswordRequest
): Promise<string> => {
  try {
    const response = await axios.put<{ message: string }>(
      `${API_URL}/api/users/user/change-password`,
      passwordData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.message;
  } catch {
    throw new Error("Failed to change password");
  }
};
