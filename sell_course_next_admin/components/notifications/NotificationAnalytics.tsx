'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Bell, 
  Eye, 
  Send,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { adminNotificationAPI } from '../../lib/api/notification';
import { NotificationAnalytics as AnalyticsType } from '../../lib/types/notification';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const NotificationAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const response = await adminNotificationAPI.getNotificationAnalytics();
      
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Thống kê thông báo</h2>
          <Button variant="outline" disabled>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Đang tải...
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-64 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Không thể tải dữ liệu thống kê</p>
        <Button variant="outline" onClick={fetchAnalytics} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Thử lại
        </Button>
      </div>
    );
  }

  // Prepare data for charts
  const typeDistributionData = Object.entries(analytics.typeDistribution).map(([key, value]) => ({
    name: key,
    value,
    label: key === 'USER' ? 'Cá nhân' : 
           key === 'COURSE' ? 'Khóa học' : 
           key === 'GLOBAL' ? 'Toàn cục' : 'Quản trị'
  }));

  const recentActivityData = analytics.recentActivity.map(activity => ({
    ...activity,
    date: new Date(activity.date).toLocaleDateString('vi-VN', { 
      month: 'short', 
      day: 'numeric' 
    })
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Thống kê thông báo</h2>
        <Button variant="outline" onClick={fetchAnalytics} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Tổng thông báo</p>
                <p className="text-2xl font-bold">{analytics.totalNotifications}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Thông báo người dùng</p>
                <p className="text-2xl font-bold">{analytics.totalUserNotifications}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Tỷ lệ đọc</p>
                <p className="text-2xl font-bold">{analytics.readRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Send className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Tỷ lệ gửi</p>
                <p className="text-2xl font-bold">{analytics.sentRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Phân bố theo loại</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ label, percent }) => `${label} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây (7 ngày)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={recentActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="created" 
                  stroke="#8884d8" 
                  name="Tạo mới"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="read" 
                  stroke="#82ca9d" 
                  name="Đã đọc"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="sent" 
                  stroke="#ffc658" 
                  name="Đã gửi"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Activity Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Biểu đồ hoạt động chi tiết</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={recentActivityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="created" fill="#8884d8" name="Tạo mới" />
              <Bar dataKey="read" fill="#82ca9d" name="Đã đọc" />
              <Bar dataKey="sent" fill="#ffc658" name="Đã gửi" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Hiệu suất thông báo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Tỷ lệ đọc trung bình</span>
              <span className="font-semibold">{analytics.readRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${analytics.readRate}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Tỷ lệ gửi thành công</span>
              <span className="font-semibold">{analytics.sentRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${analytics.sentRate}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thống kê theo loại</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(analytics.typeDistribution).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {type === 'USER' && <Users className="h-4 w-4 text-green-600" />}
                  {type === 'COURSE' && <Bell className="h-4 w-4 text-blue-600" />}
                  {type === 'GLOBAL' && <TrendingUp className="h-4 w-4 text-purple-600" />}
                  {type === 'ADMIN' && <RefreshCw className="h-4 w-4 text-red-600" />}
                  <span className="text-sm">
                    {type === 'USER' ? 'Cá nhân' : 
                     type === 'COURSE' ? 'Khóa học' : 
                     type === 'GLOBAL' ? 'Toàn cục' : 'Quản trị'}
                  </span>
                </div>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};