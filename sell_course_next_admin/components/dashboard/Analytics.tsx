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
    </div>
  );
}
