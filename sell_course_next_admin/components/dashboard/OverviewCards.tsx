"use client";
import React from "react";
import {
  DollarSign,
  ShoppingCart,
  Users,
  BookOpen,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useDashboardOverview } from "../../hooks/useDashboard";

export function OverviewCards() {
  const { data: overview, loading, error } = useDashboardOverview();

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="bg-card text-card-foreground rounded-lg shadow-sm border border-border p-4 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 col-span-full">
          <p className="text-red-600 text-sm">
            {error || "Failed to load overview data"}
          </p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Revenue",
      value: `$${overview.totalRevenue.toLocaleString()}`,
      change: `${overview.revenueGrowthPercentage >= 0 ? '+' : ''}${overview.revenueGrowthPercentage.toFixed(1)}%`,
      increasing: overview.revenueGrowthPercentage >= 0,
      icon: DollarSign,
      iconColor: "text-green-500",
    },
    {
      title: "Total Enrollments",
      value: overview.totalEnrollments.toLocaleString(),
      change: `${overview.enrollmentGrowthPercentage >= 0 ? '+' : ''}${overview.enrollmentGrowthPercentage.toFixed(1)}%`,
      increasing: overview.enrollmentGrowthPercentage >= 0,
      icon: ShoppingCart,
      iconColor: "text-blue-500",
    },
    {
      title: "Total Users",
      value: overview.totalUsers.toLocaleString(),
      change: `${overview.userGrowthPercentage >= 0 ? '+' : ''}${overview.userGrowthPercentage.toFixed(1)}%`,
      increasing: overview.userGrowthPercentage >= 0,
      icon: Users,
      iconColor: "text-purple-500",
    },
    {
      title: "Active Courses",
      value: overview.activeCourses.toLocaleString(),
      change: `${overview.courseGrowthPercentage >= 0 ? '+' : ''}${overview.courseGrowthPercentage.toFixed(1)}%`,
      increasing: overview.courseGrowthPercentage >= 0,
      icon: BookOpen,
      iconColor: "text-amber-500",
    },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-card text-card-foreground rounded-lg shadow-sm border border-border p-4"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </div>
            <div className={`p-2 rounded-full ${stat.iconColor} bg-opacity-10`}>
              <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
            </div>
          </div>
          <div className="flex items-center mt-4">
            {stat.increasing ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span
              className={`ml-1 text-xs font-medium ${
                stat.increasing ? "text-green-500" : "text-red-500"
              }`}
            >
              {stat.change} from last month
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
