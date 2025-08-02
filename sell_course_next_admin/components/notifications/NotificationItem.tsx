'use client';

import React from 'react';
import { Check, X, BookOpen, AlertCircle, CheckCircle, XCircle, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NotificationResponseDto, NotificationStatus } from '@/types/notification';
import { formatTimeAgo } from '@/lib/utils/timeUtils';

interface NotificationItemProps {
  notification: NotificationResponseDto;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClick?: (notification: NotificationResponseDto) => void;
}

export function NotificationItem({ notification, onMarkAsRead, onDelete, onClick }: NotificationItemProps) {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'COURSE_CREATED':
      case 'COURSE_UPDATED':
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'COURSE_REVIEW_REQUESTED':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'COURSE_PUBLISHED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'COURSE_REJECTED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'SUPPORT_REQUEST_CREATED':
        return <MessageCircle className="h-4 w-4 text-purple-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      case 'URGENT':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isUnread = notification.status === NotificationStatus.UNREAD;

  const handleClick = (e: React.MouseEvent) => {
    // Prevent click when clicking action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    if (onClick) {
      onClick(notification);
    }
  };

  return (
    <div 
      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${isUnread ? 'bg-blue-50' : ''}`}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          {getNotificationIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className={`text-sm font-medium truncate ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
              {notification.title}
            </h4>
            {isUnread && (
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"></div>
            )}
          </div>
          
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className={`text-xs ${getPriorityColor(notification.priority)}`}>
                {notification.priority}
              </Badge>
              
              {notification.course && (
                <Badge variant="outline" className="text-xs">
                  {notification.course.title}
                </Badge>
              )}
            </div>
            
            <span className="text-xs text-gray-500">
              {formatTimeAgo(notification.createdAt)}
            </span>
          </div>
          
          <div className="flex items-center justify-end space-x-1 mt-2">
            {isUnread && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMarkAsRead(notification.id)}
                className="h-6 px-2 text-xs"
              >
                <Check className="h-3 w-3 mr-1" />
                Mark as read
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(notification.id)}
              className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}