import axios from "axios";
import {
  User,
  UserWithPermissions,
  UpdateUserData,
  ChangePasswordData,
  AssignPermissionsData,
  BanUserData,
  UserProfileResponse,
  BanUserResponse,
  RemovePermissionResponse,
} from "../../types/users";

// Get all users (Admin only)
export const fetchAllUsers = async (token: string): Promise<UserWithPermissions[]> => {
  try {
    const response = await axios.get<UserWithPermissions[]>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/user/view_user`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Axios error fetching all users:",
        error.response?.data || error.message
      );
    } else {
      console.error("Unexpected error fetching all users:", error);
    }
    throw error;
  }
};

// Get current user profile
export const fetchUserProfile = async (token: string): Promise<User> => {
  try {
    const response = await axios.get<UserProfileResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Axios error fetching user profile:",
        error.response?.data || error.message
      );
    } else {
      console.error("Unexpected error fetching user profile:", error);
    }
    throw error;
  }
};

// Get user by ID (authenticated user)
export const fetchUserById = async (token: string): Promise<User> => {
  try {
    const response = await axios.get<User>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/user`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Axios error fetching user by ID:",
        error.response?.data || error.message
      );
    } else {
      console.error("Unexpected error fetching user by ID:", error);
    }
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (
  updateData: UpdateUserData,
  token: string,
  avatarFile?: File
): Promise<User> => {
  try {
    const formData = new FormData();
    
    // Add text fields to FormData
    Object.keys(updateData).forEach(key => {
      const value = updateData[key as keyof UpdateUserData];
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
    
    // Add avatar file if provided
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    const response = await axios.put<User>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/user`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Axios error updating user profile:",
        error.response?.data || error.message
      );
    } else {
      console.error("Unexpected error updating user profile:", error);
    }
    throw error;
  }
};

// Change password
export const changePassword = async (
  passwordData: ChangePasswordData,
  token: string
): Promise<string> => {
  try {
    const response = await axios.put<string>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users/user/change-password`,
      passwordData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Axios error changing password:",
        error.response?.data || error.message
      );
    } else {
      console.error("Unexpected error changing password:", error);
    }
    throw error;
  }
};

// Admin: Update user profile
export const updateUserAdmin = async (
  userId: string,
  updateData: UpdateUserData,
  token: string
): Promise<User> => {
  try {
    const response = await axios.put<User>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/update_user/${userId}`,
      updateData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Axios error updating user (admin):",
        error.response?.data || error.message
      );
    } else {
      console.error("Unexpected error updating user (admin):", error);
    }
    throw error;
  }
};

// Admin: Assign permissions to user
export const assignPermissionsToUser = async (
  userId: string,
  permissionData: AssignPermissionsData,
  token: string
): Promise<UserWithPermissions> => {
  try {
    const response = await axios.post<UserWithPermissions>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/assign_permissions/${userId}`,
      permissionData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Axios error assigning permissions:",
        error.response?.data || error.message
      );
    } else {
      console.error("Unexpected error assigning permissions:", error);
    }
    throw error;
  }
};

// Admin: Remove permission from user
export const removePermissionFromUser = async (
  userId: string,
  permissionId: number,
  token: string
): Promise<RemovePermissionResponse> => {
  try {
    const response = await axios.delete<RemovePermissionResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/remove_permission/${userId}/${permissionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Axios error removing permission:",
        error.response?.data || error.message
      );
    } else {
      console.error("Unexpected error removing permission:", error);
    }
    throw error;
  }
};

// Admin: Ban/Unban user
export const banUser = async (
  userId: string,
  banData: BanUserData,
  token: string
): Promise<BanUserResponse> => {
  try {
    const response = await axios.put<BanUserResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/ban/${userId}`,
      banData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Axios error banning user:",
        error.response?.data || error.message
      );
    } else {
      console.error("Unexpected error banning user:", error);
    }
    throw error;
  }
};

// Alternative endpoint for removing permission (using different URL pattern)
export const removeUserPermission = async (
  userId: string,
  permissionId: number,
  token: string
): Promise<UserWithPermissions> => {
  try {
    const response = await axios.delete<UserWithPermissions>(
      `${process.env.NEXT_PUBLIC_API_URL}/api/${userId}/permissions/${permissionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Axios error removing user permission:",
        error.response?.data || error.message
      );
    } else {
      console.error("Unexpected error removing user permission:", error);
    }
    throw error;
  }
};