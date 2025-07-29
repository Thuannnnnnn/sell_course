'use client';

import React from 'react';
import { Check, X, BookOpen, User, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NotificationResponseDto, NotificationType, NotificationPriority } from '@/types/notification';
import { formatTimeAgo } from '@/lib/utils/timeUtils';

interface NotificationItemProps {
  notification: NotificationResponseDto;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClick?: (notification: NotificationResponseDto) => void;
}

export function NotificationItem({ notification, onMarkAsRead, onDelete, onClick }: NotificationItemProps) {
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.COURSE_CREATED:
      case NotificationType.COURSE_UPDATED:
      case NotificationType.COURSE_PUBLISHED:
        return <BookOpen className="h-4 w-4" />;
      case NotificationType.COURSE_REJECTED:
        return <AlertCircle className="h-4 w-4" />;
      case NotificationType.COURSE_REVIEW_REQUESTED:
        return <User className="h-4 w-4" />;
      case NotificationType.ENROLLMENT_CREATED:
        return <User className="h-4 w-4" />;
      case NotificationType.SUPPORT_REQUEST_CREATED:
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case NotificationPriority.URGENT:
        return 'bg-red-100 text-red-800 border-red-200';
      case NotificationPriority.HIGH:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case NotificationPriority.MEDIUM:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case NotificationPriority.LOW:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeLabel = (type: NotificationType) => {
    switch (type) {
      case NotificationType.COURSE_CREATED:
        return 'New Course';
      case NotificationType.COURSE_UPDATED:
        return 'Course Updated';
      case NotificationType.COURSE_PUBLISHED:
        return 'Course Approved';
      case NotificationType.COURSE_REJECTED:
        return 'Course Rejected';
      case NotificationType.COURSE_REVIEW_REQUESTED:
        return 'Review Required';
      case NotificationType.ENROLLMENT_CREATED:
        return 'New Enrollment';
      case NotificationType.SUPPORT_REQUEST_CREATED:
        return 'Support Request';
      default:
        return 'Notification';
    }
  };

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
      className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
        notification.status === 'UNREAD' ? 'bg-blue-50/50' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 p-2 rounded-full ${getPriorityColor(notification.priority)}`}>
          {getNotificationIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-medium text-foreground truncate">
              {notification.title}
            </h4>
            <div className="flex items-center space-x-1">
              {notification.status === 'UNREAD' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarkAsRead(notification.id)}
                  className="h-6 w-6 p-0"
                >
                  <Check className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(notification.id)}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {getTypeLabel(notification.type)}
              </Badge>
              {notification.course && (
                <span className="text-xs text-muted-foreground">
                  {notification.course.title}
                </span>
              )}
            </div>
            
            <span className="text-xs text-muted-foreground">
              {formatTimeAgo(notification.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}