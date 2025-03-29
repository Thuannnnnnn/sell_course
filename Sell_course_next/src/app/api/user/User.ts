import axios from "axios";
import { User } from "@/app/type/user/User";

export const fetchUsers = async (token: string): Promise<User[]> => {
  try {
    const response = await axios.get<User[]>(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/user/view_user`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

export const AssignPermission = async (
  token: string,
  user_id: string,
  permissionIds: number[]
) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/users/assign_permissions/${user_id}`,
      { permissionIds },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error assigning permissions:", error);
    return null;
  }
};

export const removePermission = async (
  token: string,
  userId: string,
  permissionId: number
) => {
  try {
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/users/remove_permission/${userId}/${permissionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch {
    return null;
  }
};
export const updateUserProfile = async (formData: FormData, token: string) => {
  try {
    const response = await axios.put(
      `${
        process.env.NEXT_PUBLIC_BACKEND_URL
      }/api/admin/users/update_user/${formData.get("user_id")}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch {
    throw "Error updating profile.";
  }
};
export const banUser = async (
  token: string,
  userId: string,
  isBan: boolean
): Promise<User> => {
  try {
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/users/ban/${userId}`,
      { isBan },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch {
    throw "Error banning/unbanning user.";
  }
};
