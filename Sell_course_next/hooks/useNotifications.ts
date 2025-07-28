"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  NotificationResponseDto,
  NotificationListResponseDto,
  MarkNotificationDto,
  MarkAllNotificationsDto,
  NotificationStatus,
} from "@/types/notification";

export function useNotifications(userId: string) {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<NotificationResponseDto[]>(
    []
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = useCallback(
    async (url: string, options: RequestInit = {}) => {
      if (!session?.accessToken) {
        throw new Error("No access token available");
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    [session?.accessToken]
  );

  const fetchNotifications = useCallback(
    async (page = 1, limit = 20) => {
      if (!userId) return;

      setLoading(true);
      setError(null);

      try {
        const data: NotificationListResponseDto = await apiCall(
          `/api/notifications?page=${page}&limit=${limit}`
        );

        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch notifications"
        );
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    },
    [userId, apiCall]
  );

  const fetchUnreadCount = useCallback(async () => {
    if (!userId) return;

    try {
      const data = await apiCall("/api/notifications/unread-count");
      setUnreadCount(data.count);
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  }, [userId, apiCall]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        const markDto: MarkNotificationDto = {
          notificationId,
          status: NotificationStatus.READ,
        };

        await apiCall("/api/notifications/mark", {
          method: "PATCH",
          body: JSON.stringify(markDto),
        });

        // Update local state
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? {
                  ...notification,
                  status: NotificationStatus.READ,
                  readAt: new Date(),
                }
              : notification
          )
        );

        // Update unread count
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to mark notification as read"
        );
        console.error("Error marking notification as read:", err);
      }
    },
    [apiCall]
  );

  const markAllAsRead = useCallback(async () => {
    try {
      const markAllDto: MarkAllNotificationsDto = {
        status: NotificationStatus.READ,
      };

      await apiCall("/api/notifications/mark-all", {
        method: "PATCH",
        body: JSON.stringify(markAllDto),
      });

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          status: NotificationStatus.READ,
          readAt: new Date(),
        }))
      );

      setUnreadCount(0);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to mark all notifications as read"
      );
      console.error("Error marking all notifications as read:", err);
    }
  }, [apiCall]);

  const deleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        await apiCall(`/api/notifications/${notificationId}`, {
          method: "DELETE",
        });

        // Update local state
        const deletedNotification = notifications.find(
          (n) => n.id === notificationId
        );
        setNotifications((prev) =>
          prev.filter((notification) => notification.id !== notificationId)
        );

        // Update unread count if deleted notification was unread
        if (deletedNotification?.status === NotificationStatus.UNREAD) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete notification"
        );
        console.error("Error deleting notification:", err);
      }
    },
    [apiCall, notifications]
  );

  const getNotificationDetail = useCallback(
    async (notificationId: string) => {
      if (!userId || !session?.accessToken) return null;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/notifications/${notificationId}/detail`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to get notification detail");
        }

        return await response.json();
      } catch (err) {
        console.error("Error getting notification detail:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to get notification detail"
        );
        return null;
      }
    },
    [userId, session?.accessToken]
  );

  const archiveNotification = useCallback(
    async (notificationId: string) => {
      if (!userId || !session?.accessToken) return;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/notifications/${notificationId}/archive`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to archive notification");
        }

        // Update local state
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId
              ? { ...notif, status: "ARCHIVED" as any }
              : notif
          )
        );

        const archivedNotification = notifications.find(
          (n) => n.id === notificationId
        );
        if (archivedNotification?.status === NotificationStatus.UNREAD) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch (err) {
        console.error("Error archiving notification:", err);
        setError(
          err instanceof Error ? err.message : "Failed to archive notification"
        );
      }
    },
    [notifications, userId, session?.accessToken]
  );

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getNotificationDetail,
    archiveNotification,
  };
}
