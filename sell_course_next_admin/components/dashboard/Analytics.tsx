"use client";
import React from "react";
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
} from "recharts";
import { useRevenueAnalytics, useEnrollmentTrends } from "../../hooks/useDashboard";

export function Analytics() {
  const { data: revenueData, loading: revenueLoading, error: revenueError } = useRevenueAnalytics();
  const { data: enrollmentData, loading: enrollmentLoading, error: enrollmentError } = useEnrollmentTrends();

  // Debug: log enrollment data
  console.log('Enrollment Data:', enrollmentData);
  console.log('Status Distribution:', enrollmentData?.statusDistribution);

  if (revenueLoading || enrollmentLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-card rounded-lg shadow-sm border border-border p-4">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
          <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
        </div>
        <div className="bg-card rounded-lg shadow-sm border border-border p-4">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
          <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (revenueError || enrollmentError) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">
            {revenueError || enrollmentError || "Failed to load analytics data"}
          </p>
        </div>
      </div>
    );
  }

  // Transform revenue data for chart
  const chartRevenueData = revenueData?.monthlyRevenue?.map(item => ({
    month: item.month.substring(0, 3), // Get first 3 letters of month
    revenue: item.revenue,
  })) || [];

  // Transform enrollment status data for pie chart
  const completionData = enrollmentData?.statusDistribution?.map(item => ({
    name: item.status,
    value: item.percentage,
    color: item.status === 'paid' ? '#22c55e' : 
           item.status === 'pending' ? '#f59e0b' : 
           item.status === 'cancelled' ? '#ef4444' : '#e5e7eb',
  })) || [];
  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg shadow-sm border border-border p-4">
        <h2 className="text-lg font-semibold mb-4">Revenue Over Time</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartRevenueData}
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
              <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-card rounded-lg shadow-sm border border-border p-4">
        <h2 className="text-lg font-semibold mb-4">Enrollment Status Distribution</h2>
        <div className="h-64 flex items-center justify-center">
          {completionData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={completionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {completionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.375rem",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500">
              <p>No enrollment data available</p>
            </div>
          )}
        </div>
        {completionData.length > 0 && (
          <div className="flex justify-center space-x-6 mt-2">
            {completionData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{
                    backgroundColor: item.color,
                  }}
                ></div>
                <span className="text-sm text-muted-foreground">
                  {item.name}: {item.value}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
