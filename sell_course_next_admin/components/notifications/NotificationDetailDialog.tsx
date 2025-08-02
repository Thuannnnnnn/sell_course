'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Check,
  X,
  Archive,
  BookOpen,
  User,
  Calendar,
  Clock,
  Tag,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageSquare,
} from 'lucide-react';
import { NotificationResponseDto } from '@/types/notification';
import { formatDistance } from 'date-fns';

interface NotificationDetailDialogProps {
  notification: NotificationResponseDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onArchive?: (id: string) => void;
}

export function NotificationDetailDialog({
  notification,
  open,
  onOpenChange,
  onMarkAsRead,
  onDelete,
  onArchive,
}: NotificationDetailDialogProps) {
  if (!notification) return null;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'COURSE_CREATED':
        return <BookOpen className="h-6 w-6 text-blue-500" />;
      case 'COURSE_UPDATED':
        return <BookOpen className="h-6 w-6 text-orange-500" />;
      case 'COURSE_REVIEW_REQUESTED':
        return <AlertTriangle className="h-6 w-6 text-amber-500" />;
      case 'COURSE_PUBLISHED':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'COURSE_REJECTED':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <MessageSquare className="h-6 w-6 text-gray-500" />;
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return { color: 'destructive' as const, bgColor: 'bg-red-50', borderColor: 'border-red-200' };
      case 'HIGH':
        return { color: 'destructive' as const, bgColor: 'bg-orange-50', borderColor: 'border-orange-200' };
      case 'MEDIUM':
        return { color: 'default' as const, bgColor: 'bg-blue-50', borderColor: 'border-blue-200' };
      case 'LOW':
        return { color: 'secondary' as const, bgColor: 'bg-gray-50', borderColor: 'border-gray-200' };
      default:
        return { color: 'secondary' as const, bgColor: 'bg-gray-50', borderColor: 'border-gray-200' };
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'COURSE_CREATED':
        return 'New Course Created';
      case 'COURSE_UPDATED':
        return 'Course Updated';
      case 'COURSE_PUBLISHED':
        return 'Course Published';
      case 'COURSE_REJECTED':
        return 'Course Rejected';
      case 'COURSE_REVIEW_REQUESTED':
        return 'Review Required';
      default:
        return 'Notification';
    }
  };

  const priorityConfig = getPriorityConfig(notification.priority);
  const isUnread = notification.status === 'UNREAD';

  // Format metadata for display
  const formatMetadata = (metadata: Record<string, unknown>) => {
    const formatted: Array<{ key: string; label: string; value: unknown }> = [];
    
    if (metadata.courseTitle) {
      formatted.push({ key: 'courseTitle', label: 'Course Title', value: metadata.courseTitle });
    }
    if (metadata.instructorName) {
      formatted.push({ key: 'instructorName', label: 'Instructor', value: metadata.instructorName });
    }
    if (metadata.action) {
      formatted.push({ key: 'action', label: 'Action Required', value: metadata.action });
    }
    if (metadata.rejectionReason) {
      formatted.push({ key: 'rejectionReason', label: 'Rejection Reason', value: metadata.rejectionReason });
    }
    if (metadata.updatedFields) {
      formatted.push({ key: 'updatedFields', label: 'Updated Fields', value: Array.isArray(metadata.updatedFields) ? metadata.updatedFields.join(', ') : metadata.updatedFields });
    }
    if (metadata.categoryName) {
      formatted.push({ key: 'categoryName', label: 'Category', value: metadata.categoryName });
    }
    
    return formatted;
  };

  const metadataFields = formatMetadata(notification.metadata || {});

  const handleMarkAsRead = () => {
    onMarkAsRead(notification.id);
    onOpenChange(false);
  };

  const handleDelete = () => {
    onDelete(notification.id);
    onOpenChange(false);
  };

  const handleArchive = () => {
    if (onArchive) {
      onArchive(notification.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden">
        <DialogHeader className="pb-2">
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-lg ${priorityConfig.bgColor} ${priorityConfig.borderColor} border`}>
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Badge 
                  variant={priorityConfig.color}
                  className="text-xs"
                >
                  {notification.priority} Priority
                </Badge>
                {isUnread && (
                  <div className="flex items-center space-x-2 text-sm text-blue-600">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="font-medium">Unread</span>
                  </div>
                )}
              </div>
              <DialogTitle className="text-xl font-semibold leading-tight">
                {notification.title}
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                {getTypeLabel(notification.type)} • {formatDistance(new Date(notification.createdAt), new Date(), { addSuffix: true })}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Message Content */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium">Message</h3>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {notification.message}
                </p>
              </div>
            </div>

            {/* Course Information */}
            {notification.course && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-medium">Course Information</h3>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Course:</span>
                      <span className="text-sm">{notification.course.title}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Instructor:</span>
                      <div className="flex items-center space-x-2">
                        <User className="h-3 w-3" />
                        <span className="text-sm">{notification.course.instructor.username}</span>
                      </div>
                    </div>
                    <div className="pt-2">
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Metadata */}
            {metadataFields.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-medium">Additional Details</h3>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                    {metadataFields.map((field) => (
                      <div key={field.key} className="flex items-start justify-between">
                        <span className="text-sm font-medium text-muted-foreground min-w-0 flex-shrink-0 mr-4">
                          {field.label}:
                        </span>
                        <span className="text-sm text-right flex-1 min-w-0">
                          {typeof field.value === 'string' ? field.value : JSON.stringify(field.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Timeline Information */}
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium">Timeline</h3>
              </div>
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Created:</span>
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(notification.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                {notification.readAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Read:</span>
                    <div className="flex items-center space-x-2 text-sm">
                      <Check className="h-3 w-3" />
                      <span>{new Date(notification.readAt).toLocaleString()}</span>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge 
                    variant={notification.status === 'UNREAD' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {notification.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="pt-4 space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          
          {isUnread && (
            <Button variant="default" onClick={handleMarkAsRead}>
              <Check className="h-4 w-4 mr-2" />
              Mark as Read
            </Button>
          )}
          
          {onArchive && notification.status !== 'ARCHIVED' && (
            <Button variant="outline" onClick={handleArchive}>
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </Button>
          )}
          
          <Button variant="destructive" onClick={handleDelete}>
            <X className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}