'use client';

import React, { useState } from 'react';
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
import { Checkbox } from '../ui/checkbox';

import { adminNotificationAPI } from '../../lib/api/notification';
import { CreateNotificationRequest } from '../../lib/types/notification';
import UserSelector from './UserSelector';
import CourseSelector from './CourseSelector';

const formSchema = z.object({
  title: z.string().min(1, 'Tiêu đề là bắt buộc').max(255, 'Tiêu đề không được quá 255 ký tự'),
  message: z.string().min(1, 'Nội dung là bắt buộc'),
  type: z.enum(['USER', 'COURSE', 'GLOBAL', 'ADMIN'], {
    required_error: 'Vui lòng chọn loại thông báo',
  }),
  isGlobal: z.boolean(),
  courseIds: z.array(z.string()).optional(),
  userIds: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CreateNotificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateNotificationDialog: React.FC<CreateNotificationDialogProps> = ({
  isOpen,
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
      isGlobal: false,
      courseIds: [],
      userIds: [],
    },
  });

  const watchedType = form.watch('type');

  const handleSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      
      const requestData: CreateNotificationRequest = {
        title: data.title,
        message: data.message,
        type: data.type,
        isGlobal: data.isGlobal,
      };

      // Add courseIds if type is COURSE and courseIds are provided
      if (data.type === 'COURSE' && selectedCourseIds.length > 0) {
        requestData.courseIds = selectedCourseIds;
      }

      // Add userIds if type is USER and userIds are provided
      if (data.type === 'USER' && selectedUserIds.length > 0) {
        requestData.userIds = selectedUserIds;
      }

      await adminNotificationAPI.createNotification(requestData);
      
      onSuccess();
      form.reset();
      setSelectedCourseIds([]);
      setSelectedUserIds([]);
    } catch (error) {
      console.error('Error creating notification:', error);
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
          <DialogTitle>Tạo thông báo mới</DialogTitle>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                {isLoading ? 'Đang tạo...' : 'Tạo thông báo'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};