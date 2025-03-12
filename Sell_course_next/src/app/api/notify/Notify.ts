import { Notify } from "@/app/type/notify/Notify";
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

export const addNotification = async (
  notification: Notify,
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
  notification: Notify,
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
