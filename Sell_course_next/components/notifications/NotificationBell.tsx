'use client';

import React, { useState } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { NotificationDropdown } from './NotificationDropdown';
import { useNotifications } from '../../hooks/useNotifications';


interface NotificationBellProps {
  userId: string;
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  userId,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  
  // Use the updated useNotifications hook with WebSocket support
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  } = useNotifications({
    userId,
    autoRefresh: true,
    refreshInterval: 30000,
    enableWebSocket: true,
  });

  // Handle notification read
  const handleNotificationRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`relative ${className}`}
          disabled={isLoading}
        >
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-80 p-0"
        sideOffset={5}
      >
        <NotificationDropdown
          notifications={notifications}
          isLoading={isLoading}
          onNotificationRead={handleNotificationRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onRefresh={refreshNotifications}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};