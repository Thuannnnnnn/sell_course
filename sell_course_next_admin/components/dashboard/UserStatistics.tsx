"use client";
import React from "react";
import { Users, UserPlus, TrendingUp, Shield } from "lucide-react";
import { useUserStatistics } from "../../hooks/useDashboard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function UserStatistics() {
  const { data: userData, loading, error } = useUserStatistics();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-card rounded-lg shadow-sm border border-border p-4">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
          <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, index) => (
            <div key={index} className="bg-card rounded-lg shadow-sm border border-border p-4">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4 animate-pulse"></div>
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600 text-sm">
          {error || "Failed to load user statistics"}
        </p>
      </div>
    );
  }

  // Transform user growth data for chart
  const chartData = userData.userGrowth.map(item => ({
    month: item.month.substring(0, 3),
    newUsers: item.newUsers,
    totalUsers: item.totalUsers,
  }));

  return (
    <div className="space-y-6">
      {/* User Growth Chart */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-4">
        <h2 className="text-lg font-semibold mb-4">User Growth Trend</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 20,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.375rem",
                }}
              />
              <Line
                type="monotone"
                dataKey="newUsers"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                name="New Users"
              />
              <Line
                type="monotone"
                dataKey="totalUsers"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                name="Total Users"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Overview */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-4">
          <h3 className="text-lg font-semibold mb-4">User Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-600">Total Active Users</span>
              </div>
              <span className="font-semibold">
                {userData.totalActiveUsers.toLocaleString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600">New This Month</span>
              </div>
              <span className="font-semibold">
                {userData.newUsersThisMonth.toLocaleString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-gray-600">Growth Rate</span>
              </div>
              <span className={`font-semibold ${
                userData.userGrowthPercentage >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {userData.userGrowthPercentage >= 0 ? '+' : ''}
                {userData.userGrowthPercentage.toFixed(1)}%
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-red-500" />
                <span className="text-sm text-gray-600">Banned Users</span>
              </div>
              <span className="font-semibold text-red-600">
                {userData.totalBannedUsers.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Role Distribution */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-4">
          <h3 className="text-lg font-semibold mb-4">Role Distribution</h3>
          <div className="space-y-3">
            {userData.roleDistribution.map((role, index) => (
              <div key={role.role} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">
                    {role.role.toLowerCase()}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold">
                      {role.count.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({role.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      index === 0 ? 'bg-blue-500' :
                      index === 1 ? 'bg-green-500' :
                      index === 2 ? 'bg-purple-500' : 'bg-gray-500'
                    }`}
                    style={{ width: `${role.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}