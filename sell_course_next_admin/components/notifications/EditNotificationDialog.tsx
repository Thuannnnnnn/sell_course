'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

import { adminNotificationAPI } from '../../lib/api/notification';
import { Notify, UpdateNotificationRequest } from '../../lib/types/notification';
import UserSelector from './UserSelector';
import CourseSelector from './CourseSelector';

const formSchema = z.object({
  title: z.string().min(1, 'Tiêu đề là bắt buộc').max(255, 'Tiêu đề không được quá 255 ký tự'),
  message: z.string().min(1, 'Nội dung là bắt buộc'),
  type: z.enum(['USER', 'COURSE', 'GLOBAL', 'ADMIN'], {
    required_error: 'Vui lòng chọn loại thông báo',
  }),
  courseIds: z.array(z.string()).optional(),
  userIds: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EditNotificationDialogProps {
  isOpen: boolean;
  notification: Notify;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditNotificationDialog: React.FC<EditNotificationDialogProps> = ({
  isOpen,
  notification,
  onClose,
  onSuccess
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      message: '',
      type: 'GLOBAL',
      courseIds: [],
      userIds: [],
    },
  });

  const watchedType = form.watch('type');

  // Load notification data and recipients
  const loadCourseIds = useCallback(async () => {
    try {
      const response = await adminNotificationAPI.getNotificationCourseIds(notification.notifyId);
      if (response.success) {
        setSelectedCourseIds(response.courseIds);
        form.setValue('courseIds', response.courseIds);
      }
    } catch (error) {
      console.error('Error loading course IDs:', error);
    }
  }, [notification.notifyId, form]);

  const loadUserIds = useCallback(async () => {
    try {
      const response = await adminNotificationAPI.getNotificationUserIds(notification.notifyId);
      if (response.success) {
        setSelectedUserIds(response.userIds);
        form.setValue('userIds', response.userIds);
      }
    } catch (error) {
      console.error('Error loading user IDs:', error);
    }
  }, [notification.notifyId, form]);

  useEffect(() => {
    if (notification && isOpen) {
      form.reset({
        title: notification.title,
        message: notification.message,
        type: notification.type,
        courseIds: [],
        userIds: [],
      });

      // Load course IDs if notification type is COURSE
      if (notification.type === 'COURSE') {
        loadCourseIds();
      }

      // Load user IDs if notification type is USER
      if (notification.type === 'USER') {
        loadUserIds();
      }
    }
  }, [notification, isOpen, form, loadCourseIds, loadUserIds]);

  const handleSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      
      const requestData: UpdateNotificationRequest = {
        title: data.title,
        message: data.message,
        type: data.type,
      };

      // Add courseIds if type is COURSE and courseIds are provided
      if (data.type === 'COURSE' && selectedCourseIds.length > 0) {
        requestData.courseIds = selectedCourseIds;
      }

      // Add userIds if type is USER and userIds are provided
      if (data.type === 'USER' && selectedUserIds.length > 0) {
        requestData.userIds = selectedUserIds;
      }

      await adminNotificationAPI.updateNotification(notification.notifyId, requestData);
      
      onSuccess();
    } catch (error) {
      console.error('Error updating notification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCoursesChange = (courseIds: string[]) => {
    setSelectedCourseIds(courseIds);
    form.setValue('courseIds', courseIds);
  };

  const handleUsersChange = (userIds: string[]) => {
    setSelectedUserIds(userIds);
    form.setValue('userIds', userIds);
  };

  const handleClose = () => {
    form.reset();
    setSelectedCourseIds([]);
    setSelectedUserIds([]);
    onClose();
  };


  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa thông báo</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập tiêu đề thông báo..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Message */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nội dung *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập nội dung thông báo..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại thông báo *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại thông báo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="GLOBAL">Toàn cục</SelectItem>
                      <SelectItem value="COURSE">Khóa học</SelectItem>
                      <SelectItem value="USER">Cá nhân</SelectItem>
                      <SelectItem value="ADMIN">Quản trị</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Course Selector - only show if type is COURSE */}
            {watchedType === 'COURSE' && (
              <CourseSelector
                selectedCourses={selectedCourseIds}
                onCoursesChange={handleCoursesChange}
              />
            )}

            {/* User Selector - only show if type is USER */}
            {watchedType === 'USER' && (
              <UserSelector
                selectedUsers={selectedUserIds}
                onUsersChange={handleUsersChange}
              />
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Đang cập nhật...' : 'Cập nhật'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};