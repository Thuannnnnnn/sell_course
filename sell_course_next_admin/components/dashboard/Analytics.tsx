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
export function Analytics() {
  const revenueData = [
    {
      month: "Jan",
      revenue: 4000,
    },
    {
      month: "Feb",
      revenue: 3000,
    },
    {
      month: "Mar",
      revenue: 5000,
    },
    {
      month: "Apr",
      revenue: 4500,
    },
    {
      month: "May",
      revenue: 6000,
    },
    {
      month: "Jun",
      revenue: 5500,
    },
  ];
  const completionData = [
    {
      name: "Completed",
      value: 65,
      color: "#3b82f6",
    },
    {
      name: "In Progress",
      value: 25,
      color: "#f59e0b",
    },
    {
      name: "Not Started",
      value: 10,
      color: "#e5e7eb",
    },
  ];
  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg shadow-sm border border-border p-4">
        <h2 className="text-lg font-semibold mb-4">Revenue Over Time</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={revenueData}
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
        <h2 className="text-lg font-semibold mb-4">Course Completion Rate</h2>
        <div className="h-64 flex items-center justify-center">
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
        </div>
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
      </div>
    </div>
  );
}
