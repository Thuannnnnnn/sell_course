'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
  isRead: boolean;
  notify: {
    notifyId: string;
    title: string;
    message: string;
    type: string;
    createdAt: string;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  isConnected: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    if (!session?.user?.id) return;

    // Kết nối WebSocket
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
      query: {
        userId: session.user.id,
      },
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('🔗 Connected to notification server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from notification server');
      setIsConnected(false);
    });

    // Lắng nghe thông báo mới
    newSocket.on('newNotification', (notification: Notification) => {
      console.log('📢 New notification received:', notification);
      
      setNotifications(prev => [notification, ...prev]);
      
      // Hiển thị toast notification
      toast.success(notification.notify.title, {
        description: notification.notify.message,
        duration: 5000,
        action: {
          label: 'Xem',
          onClick: () => {
            // Navigate to notifications page or handle view action
            console.log('View notification:', notification.id);
          },
        },
      });
    });

    // Lắng nghe cập nhật thông báo
    newSocket.on('updateNotification', (notification: Notification) => {
      console.log('🔄 Notification updated:', notification);
      
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? notification : n)
      );
    });

    // Lắng nghe xóa thông báo
    newSocket.on('removeNotification', (notificationId: string) => {
      console.log('🗑️ Notification removed:', notificationId);
      
      setNotifications(prev => 
        prev.filter(n => n.id !== notificationId)
      );
    });

    // Lắng nghe mark all as read
    newSocket.on('markAllAsSent', (updatedNotifications: Notification[]) => {
      console.log('✅ All notifications marked as read');
      setNotifications(updatedNotifications);
    });



    // Cleanup
    return () => {
      newSocket.disconnect();
    };
  }, [session?.user?.id]);

  // Load initial notifications
  useEffect(() => {
    if (!session?.user?.id) return;

    const loadNotifications = async () => {
      try {
        const response = await fetch('/api/notifications', {
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications || []);
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };

    loadNotifications();
  }, [session?.user?.id, session?.accessToken]);

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, isRead: true }))
        );
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isConnected,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};