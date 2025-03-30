import { Notify } from "@/app/type/notify/Notify";
import { UserNotify } from "@/app/type/notify/User_notify";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const fetchNotifications = async (token: string): Promise<Notify[]> => {
  try {
    const response = await axios.get<Notify[]>(
      `${BASE_URL}/api/admin/notify/`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

export const fetchNotificationByid = async (
  token: string,
  id: string
): Promise<Notify[]> => {
  try {
    const response = await axios.get<Notify[]>(
      `${BASE_URL}/api/admin/notify/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

interface NotificationCreateData {
  title: string;
  message: string;
  type: "GLOBAL" | "USER" | "COURSE" | "ADMIN";
  isGlobal: boolean;
  courseIds?: string[];
  userIds?: string[];
}

export const addNotification = async (
  notification: NotificationCreateData,
  token: string
): Promise<Notify> => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/admin/notify/create`,
      notification,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding notification:", error);
    throw error;
  }
};

export const updateNotification = async (
  id: string,
  notification: NotificationCreateData,
  token: string
): Promise<Notify> => {
  try {
    const response = await axios.put(
      `${BASE_URL}/api/admin/notify/${id}`,
      notification,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating notification:", error);
    throw error;
  }
};

export const deleteNotification = async (
  id: string,
  token: string
): Promise<void> => {
  try {
    await axios.delete(`${BASE_URL}/api/admin/notify/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

export const fetchUserNotifications = async (
  token: string,
  userId: string
): Promise<UserNotify[]> => {
  try {
    const response = await axios.get<UserNotify[]>(
      `${BASE_URL}/api/user_notify/${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    throw error;
  }
};

export const fetchAllUserNotifications = async (
  token: string
): Promise<UserNotify[]> => {
  try {
    const response = await axios.get<UserNotify[]>(
      `${BASE_URL}/api/user_notify/all`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching all user notifications:", error);
    throw error;
  }
};

export const updateUserNotificationStatus = async (
  id: string,
  token: string,
  updateData: { is_read: boolean }
): Promise<UserNotify> => {
  try {
    const response = await axios.put(
      `${BASE_URL}/api/user_notify/update/${id}`,
      updateData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating user notification status:", error);
    throw error;
  }
};

export const markAllNotificationsAsSent = async (
  userId: string,
  token: string
): Promise<void> => {
  try {
    await axios.post(
      `${BASE_URL}/api/user_notify/mark-all-sent/${userId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (error) {
    console.error("Error marking all notifications as sent:", error);
    throw error;
  }
};

