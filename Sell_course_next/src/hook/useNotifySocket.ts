import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { UserNotify } from "@/app/type/notify/User_notify";
import { fetchUserNotifications } from "@/app/api/notify/Notify";

export const useSocket = (userId?: string, token?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<UserNotify[]>([]);

  useEffect(() => {
    if (!userId || !token) return;

    const newSocket = io(process.env.NEXT_PUBLIC_BACKEND_URL, {
      transports: ["websocket"],
      query: { userId },
    });

    const fetchNotifications = async () => {
      try {
        const data = await fetchUserNotifications(token, userId);
        setNotifications(data);
        newSocket.emit("initializeNotifications", {
          userId,
          notifications: data,
        });
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
    newSocket.on("markAllAsSent", (updatedNotifications) => {
      setNotifications(updatedNotifications);
    });
    newSocket.on("newNotification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    newSocket.on("updateNotification", (updatedNotification) => {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === updatedNotification.id ? updatedNotification : n
        )
      );
    });

    newSocket.on("removeNotification", (notificationId) => {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit("leaveRoom", userId);
      newSocket.disconnect();
    };
  }, [userId, token]);

  return { socket, notifications };
};
