'use client';

import React from 'react';
import { 
  Bell, 
  CheckCheck, 
  RefreshCw, 
  BookOpen,
  Users,
  Globe,
  Shield
} from 'lucide-react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { UserNotify } from '../../lib/types/notification';

// Helper function to format time ago in Vietnamese
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'vừa xong';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ngày trước`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} tuần trước`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} tháng trước`;
  }
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} năm trước`;
};

interface NotificationDropdownProps {
  notifications: UserNotify[];
  isLoading: boolean;
  onNotificationRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onRefresh: () => void;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'COURSE':
      return <BookOpen className="h-4 w-4" />;
    case 'USER':
      return <Users className="h-4 w-4" />;
    case 'GLOBAL':
      return <Globe className="h-4 w-4" />;
    case 'ADMIN':
      return <Shield className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

const getNotificationTypeColor = (type: string) => {
  switch (type) {
    case 'COURSE':
      return 'bg-blue-100 text-blue-800';
    case 'USER':
      return 'bg-green-100 text-green-800';
    case 'GLOBAL':
      return 'bg-purple-100 text-purple-800';
    case 'ADMIN':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  isLoading,
  onNotificationRead,
  onMarkAllAsRead,
  onRefresh
}) => {
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleNotificationClick = (notification: UserNotify) => {
    if (!notification.is_read) {
      onNotificationRead(notification.id);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Đang tải thông báo...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h3 className="font-semibold">Thông báo</h3>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} mới
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllAsRead}
              className="text-xs"
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Đánh dấu tất cả
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <ScrollArea className="h-96">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Không có thông báo nào
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                  !notification.is_read ? 'bg-blue-50/50' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex gap-3">
                  {/* Icon */}
                  <div className={`flex-shrink-0 p-2 rounded-full ${getNotificationTypeColor(notification.notify.type)}`}>
                    {getNotificationIcon(notification.notify.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`text-sm font-medium ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notification.notify.title}
                      </h4>
                      
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {notification.notify.message}
                    </p>
                    
                    {/* Course info if available */}
                    {notification.notify.course && (
                      <div className="flex items-center gap-1 mt-2">
                        <BookOpen className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {notification.notify.course.title}
                        </span>
                      </div>
                    )}
                    
                    {/* Time */}
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatTimeAgo(new Date(notification.notify.createdAt))}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {notifications.length > 0 && (
        <>
          <Separator />
          <div className="p-2">
            <Button
              variant="ghost"
              className="w-full justify-center text-sm"
              onClick={() => {
                // Navigate to notifications page
                window.location.href = '/notifications';
              }}
            >
              Xem tất cả thông báo
            </Button>
          </div>
        </>
      )}
    </div>
  );
};