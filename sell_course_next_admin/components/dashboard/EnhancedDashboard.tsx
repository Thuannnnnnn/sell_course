"use client";
import React, { useState } from "react";
import { OverviewCards } from "./OverviewCards";
import { Analytics } from "./Analytics";
import { ActivityFeed } from "./ActivityFeed";
import { CoursePerformance } from "./CoursePerformance";
import { UserStatistics } from "./UserStatistics";
import { Button } from "../ui/button";
import { RefreshCw, Download } from "lucide-react";
import { useDashboardOverview, useDashboardCache } from "../../hooks/useDashboard";

export function EnhancedDashboard() {
  const { refetch: refetchOverview } = useDashboardOverview();
  const { clearCache, clearing } = useDashboardCache();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchOverview();
      // You can add more refetch calls here for other components
    } finally {
      setRefreshing(false);
    }
  };

  const handleClearCache = async () => {
    await clearCache();
    await handleRefresh();
  };

  const handleExport = () => {
    // Implement export functionality
    console.log("Export dashboard data");
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Enhanced Dashboard</h1>
          <p className="text-gray-600 text-sm">
            Real-time insights and analytics for your course platform
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          
          <Button
            onClick={handleClearCache}
            disabled={clearing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${clearing ? 'animate-spin' : ''}`} />
            {clearing ? 'Clearing...' : 'Clear Cache'}
          </Button>
          
          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="mb-6">
        <OverviewCards />
      </div>

      {/* Analytics and Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Analytics />
        </div>
        <div>
          <ActivityFeed />
        </div>
      </div>

      {/* Course Performance */}
      <div className="mb-6">
        <CoursePerformance />
      </div>

      {/* User Statistics */}
      <div className="mb-6">
        <UserStatistics />
      </div>
    </div>
  );
}