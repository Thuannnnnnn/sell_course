"use client";
import React from "react";
import { User, MessageSquare, FileText, BookOpen, CreditCard } from "lucide-react";
import { useRecentActivities } from "../../hooks/useDashboard";

export function ActivityFeed() {
  const { data: activitiesData, loading, error } = useRecentActivities(10);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'enrollment':
        return { icon: User, color: "text-green-500 bg-green-100" };
      case 'course_created':
        return { icon: BookOpen, color: "text-blue-500 bg-blue-100" };
      case 'user_registered':
        return { icon: User, color: "text-purple-500 bg-purple-100" };
      case 'forum_post':
        return { icon: MessageSquare, color: "text-amber-500 bg-amber-100" };
      case 'course_completed':
        return { icon: FileText, color: "text-green-500 bg-green-100" };
      case 'payment_received':
        return { icon: CreditCard, color: "text-blue-500 bg-blue-100" };
      default:
        return { icon: FileText, color: "text-gray-500 bg-gray-100" };
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg shadow-sm border border-border h-full">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
        </div>
        <div className="p-4">
          <ul className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <li key={index} className="flex items-start animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full mr-3"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (error || !activitiesData) {
    return (
      <div className="bg-card rounded-lg shadow-sm border border-border h-full">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
        </div>
        <div className="p-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">
              {error || "Failed to load activities"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const activities = activitiesData.activities.map(activity => {
    const { icon: Icon, color } = getActivityIcon(activity.type);
    return {
      id: activity.id,
      type: activity.type,
      message: activity.description,
      time: formatTimeAgo(activity.timestamp),
      icon: Icon,
      iconColor: color,
    };
  });
  return (
    <div className="bg-card rounded-lg shadow-sm border border-border h-full">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
      </div>
      <div className="p-4">
        <ul className="space-y-4">
          {activities.map((activity) => (
            <li key={activity.id} className="flex items-start">
              <div className={`p-2 rounded-full ${activity.iconColor} mr-3`}>
                <activity.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm">{activity.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {activity.time}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="p-4 border-t border-border">
        <button className="w-full py-2 text-sm text-center text-primary hover:text-primary/80">
          View All Activity
        </button>
      </div>
    </div>
  );
}
