'use client';

import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  Bell, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Users,
  BookOpen,
  Globe,
  Shield,
  MoreHorizontal,
  RefreshCw
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Separator } from '../ui/separator';
import { adminNotificationAPI } from '../../lib/api/notification';
import { Notify } from '../../lib/types/notification';
import { CreateNotificationDialog } from './CreateNotificationDialog';
import { EditNotificationDialog } from './EditNotificationDialog';
import { NotificationAnalytics } from './NotificationAnalytics';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'COURSE':
      return <BookOpen className="h-5 w-5" />;
    case 'USER':
      return <Users className="h-5 w-5" />;
    case 'GLOBAL':
      return <Globe className="h-5 w-5" />;
    case 'ADMIN':
      return <Shield className="h-5 w-5" />;
    default:
      return <Bell className="h-5 w-5" />;
  }
};

const getNotificationTypeColor = (type: string) => {
  switch (type) {
    case 'COURSE':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'USER':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'GLOBAL':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'ADMIN':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const NotificationManagement: React.FC = () => {
  const [notifications, setNotifications] = useState<Notify[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const [activeTab, setActiveTab] = useState<string>('notifications');

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [selectedNotification, setSelectedNotification] = useState<Notify | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [notificationToDelete, setNotificationToDelete] = useState<Notify | null>(null);

  // Fetch data
  const fetchNotifications = async (skipLoading = false) => {
    try {
      if (!skipLoading) setIsLoading(true);
      console.log('📡 Fetching notifications...');
      
      const response = await adminNotificationAPI.getAllNotifications();
      
      if (response.success) {
        console.log('📡 Fetched notifications count:', response.data.length);
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      if (!skipLoading) setIsLoading(false);
    }
  };



  // Handle delete notification
  const handleDeleteNotification = async (notification: Notify) => {
    try {
      console.log('🗑️ Deleting notification:', notification.notifyId);
      const response = await adminNotificationAPI.deleteNotification(notification.notifyId);
      console.log('🗑️ Delete response:', response);
      
      if (response.success) {
        console.log('✅ Delete successful, updating UI...');
        // Update notifications list immediately
        setNotifications(prev => {
          console.log('📝 Before delete - notifications count:', prev.length);
          console.log('📝 Deleting notification ID:', notification.notifyId);
          
          const updated = prev.filter(n => n.notifyId !== notification.notifyId);
          console.log('📝 After delete - notifications count:', updated.length);
          
          // Check for duplicates
          const uniqueIds = new Set(updated.map(n => n.notifyId));
          if (uniqueIds.size !== updated.length) {
            console.warn('⚠️ Duplicate notifications detected!');
          }
          
          return updated;
        });
        setIsDeleteDialogOpen(false);
        setNotificationToDelete(null);
        console.log('✅ UI updated successfully');
        
        // Note: Removed force refresh to avoid conflicts with immediate update
      } else {
        console.error('❌ Delete failed:', response.message);
        alert('Xóa thông báo thất bại: ' + response.message);
      }
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
      alert('Có lỗi xảy ra khi xóa thông báo');
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || notification.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNotifications = filteredNotifications.slice(startIndex, startIndex + itemsPerPage);

  // Statistics
  const stats = {
    total: notifications.length,
    global: notifications.filter(n => n.type === 'GLOBAL').length,
    course: notifications.filter(n => n.type === 'COURSE').length,
    user: notifications.filter(n => n.type === 'USER').length,
    admin: notifications.filter(n => n.type === 'ADMIN').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý thông báo</h1>
          <p className="text-muted-foreground">
            Tạo và quản lý thông báo cho người dùng
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              fetchNotifications();
            }}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tạo thông báo
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="notifications">Thông báo</TabsTrigger>
          <TabsTrigger value="user-notifications">Thông báo người dùng</TabsTrigger>
          <TabsTrigger value="analytics">Thống kê</TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tổng số</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Toàn cục</p>
                    <p className="text-2xl font-bold">{stats.global}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Khóa học</p>
                    <p className="text-2xl font-bold">{stats.course}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Cá nhân</p>
                    <p className="text-2xl font-bold">{stats.user}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Quản trị</p>
                    <p className="text-2xl font-bold">{stats.admin}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Bộ lọc
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm thông báo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Loại thông báo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả loại</SelectItem>
                    <SelectItem value="COURSE">Khóa học</SelectItem>
                    <SelectItem value="USER">Cá nhân</SelectItem>
                    <SelectItem value="GLOBAL">Toàn cục</SelectItem>
                    <SelectItem value="ADMIN">Quản trị</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notifications List */}
          <Card>
            <CardHeader>
              <CardTitle>
                Danh sách thông báo ({filteredNotifications.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Đang tải thông báo...</p>
                </div>
              ) : paginatedNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Không có thông báo nào</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paginatedNotifications.map((notification) => (
                    <div
                      key={notification.notifyId}
                      className="p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex gap-4">
                        {/* Icon */}
                        <div className={`flex-shrink-0 p-3 rounded-full ${getNotificationTypeColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">
                                  {notification.title}
                                </h3>
                                
                                <Badge variant="outline" className={getNotificationTypeColor(notification.type)}>
                                  {notification.type}
                                </Badge>
                                
                                {notification.isGlobal && (
                                  <Badge variant="secondary">Toàn cục</Badge>
                                )}
                                
                                {notification.isAdmin && (
                                  <Badge variant="destructive">Quản trị</Badge>
                                )}
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                {notification.message}
                              </p>
                              
                              {/* Course info */}
                              {notification.course && (
                                <div className="flex items-center gap-2 mb-2">
                                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">
                                    {notification.course.title}
                                  </span>
                                </div>
                              )}
                              
                              {/* Time */}
                              <p className="text-xs text-muted-foreground">
                                Tạo {formatDistanceToNow(new Date(notification.createdAt), {
                                  addSuffix: true,
                                  locale: vi
                                })}
                              </p>
                            </div>
                            
                            {/* Actions */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedNotification(notification);
                                    setIsEditDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Chỉnh sửa
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setNotificationToDelete(notification);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Xóa
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <>
                  <Separator className="my-4" />
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Hiển thị {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredNotifications.length)} 
                      trong tổng số {filteredNotifications.length} thông báo
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Trước
                      </Button>
                      
                      <span className="text-sm">
                        Trang {currentPage} / {totalPages}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Sau
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Notifications Tab */}
        <TabsContent value="user-notifications">
          {/* This will be implemented in a separate component */}
          <Card>
            <CardHeader>
              <CardTitle>Thông báo người dùng</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Tính năng quản lý thông báo người dùng sẽ được triển khai trong component riêng.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <NotificationAnalytics />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateNotificationDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={() => {
          fetchNotifications();
          setIsCreateDialogOpen(false);
        }}
      />

      {selectedNotification && (
        <EditNotificationDialog
          isOpen={isEditDialogOpen}
          notification={selectedNotification}
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedNotification(null);
          }}
          onSuccess={() => {
            fetchNotifications();
            setIsEditDialogOpen(false);
            setSelectedNotification(null);
          }}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa thông báo &quot;{notificationToDelete?.title}&quot;? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => notificationToDelete && handleDeleteNotification(notificationToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};