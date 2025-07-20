'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/components/notifications/NotificationProvider';
import { Bell, CheckCircle, AlertCircle, Info, Users } from 'lucide-react';
import { toast } from 'sonner';

const TestNotificationsPage = () => {
  const { data: session } = useSession();
  const { notifications, unreadCount, isConnected } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);

  const createTestCourse = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', `Test Course ${Date.now()}`);
      formData.append('description', 'This is a test course for automatic notifications');
      formData.append('short_description', 'Test course description');
      formData.append('price', '100000');
      formData.append('duration', '60');
      formData.append('skill', 'Beginner');
      formData.append('level', 'Basic');
      formData.append('status', 'false');
      formData.append('instructorId', session?.user?.id || '');
      formData.append('categoryId', 'test-category-id'); // You might need to use a real category ID

      const response = await fetch('/api/courses', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      });

      if (response.ok) {
        toast.success('✅ Test course created successfully!', {
          description: 'Automatic notifications should be sent to relevant users.',
        });
      } else {
        throw new Error('Failed to create test course');
      }
    } catch (error) {
      console.error('Error creating test course:', error);
      toast.error('❌ Failed to create test course', {
        description: 'Please check the console for more details.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateTestCourse = async () => {
    setIsLoading(true);
    try {
      // This would need a real course ID
      const courseId = 'test-course-id';
      const formData = new FormData();
      formData.append('title', `Updated Test Course ${Date.now()}`);
      formData.append('description', 'This course has been updated for testing notifications');

      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        body: formData,
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      });

      if (response.ok) {
        toast.success('✅ Test course updated successfully!', {
          description: 'Update notifications should be sent to relevant users.',
        });
      } else {
        throw new Error('Failed to update test course');
      }
    } catch (error) {
      console.error('Error updating test course:', error);
      toast.error('❌ Failed to update test course', {
        description: 'Please check the console for more details.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'COURSE_REVIEWER':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'ADMIN':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'CONTENT_MANAGER':
        return <Info className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Test Automatic Notifications</h1>
          <p className="text-gray-600 mt-2">
            Test the automatic notification system for course creation and updates
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
          </Badge>
          <Badge variant="outline">
            <Bell className="h-3 w-3 mr-1" />
            {unreadCount} unread
          </Badge>
        </div>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            WebSocket Connection Status
          </CardTitle>
          <CardDescription>
            Real-time notification connection status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="font-medium">
              {isConnected ? 'Connected to notification server' : 'Disconnected from notification server'}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            User ID: {session?.user?.id || 'Not logged in'}
          </p>
          <p className="text-sm text-gray-600">
            Role: {session?.user?.role || 'Unknown'}
          </p>
        </CardContent>
      </Card>

      {/* Test Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>🎓 Test Course Creation</CardTitle>
            <CardDescription>
              Create a test course to trigger automatic notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                <p><strong>Expected notifications:</strong></p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>📢 CourseReviewer: &quot;Khóa học mới cần review&quot;</li>
                  <li>📢 Admin: &quot;Khóa học mới được tạo&quot;</li>
                  <li>📢 Content Manager: &quot;Khóa học mới trong category [X]&quot;</li>
                </ul>
              </div>
              <Button 
                onClick={createTestCourse} 
                disabled={isLoading || !session}
                className="w-full"
              >
                {isLoading ? 'Creating...' : 'Create Test Course'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>✏️ Test Course Update</CardTitle>
            <CardDescription>
              Update a test course to trigger update notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                <p><strong>Expected notifications:</strong></p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>📢 CourseReviewer: &quot;Khóa học đã được chỉnh sửa, cần review lại&quot;</li>
                  <li>📢 Admin: &quot;Khóa học [X] đã được cập nhật&quot;</li>
                </ul>
              </div>
              <Button 
                onClick={updateTestCourse} 
                disabled={isLoading || !session}
                variant="outline"
                className="w-full"
              >
                {isLoading ? 'Updating...' : 'Update Test Course'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Recent Notifications ({notifications.length})
          </CardTitle>
          <CardDescription>
            Latest notifications received via WebSocket
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No notifications yet</p>
              <p className="text-sm">Create or update a course to see notifications</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border ${
                    !notification.isRead ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notification.notify.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm">
                          {notification.notify.title}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {notification.notify.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.notify.message}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(notification.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestNotificationsPage;