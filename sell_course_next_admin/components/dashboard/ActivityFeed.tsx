"use client";
import React from "react";
import { ShoppingCart, User, MessageSquare, FileText } from "lucide-react";
export function ActivityFeed() {
  const activities = [
    {
      id: 1,
      type: "purchase",
      message: 'Alex Johnson purchased "React Fundamentals"',
      time: "10 minutes ago",
      icon: ShoppingCart,
      iconColor: "text-blue-500 bg-blue-100",
    },
    {
      id: 2,
      type: "enrollment",
      message: 'New student joined "Advanced JavaScript"',
      time: "1 hour ago",
      icon: User,
      iconColor: "text-green-500 bg-green-100",
    },
    {
      id: 3,
      type: "comment",
      message: 'New comment on "UI/UX Design Principles"',
      time: "2 hours ago",
      icon: MessageSquare,
      iconColor: "text-purple-500 bg-purple-100",
    },
    {
      id: 4,
      type: "course",
      message: 'You published "Node.js Backend Development"',
      time: "1 day ago",
      icon: FileText,
      iconColor: "text-amber-500 bg-amber-100",
    },
    {
      id: 5,
      type: "purchase",
      message: 'Maria Garcia purchased "React Fundamentals"',
      time: "1 day ago",
      icon: ShoppingCart,
      iconColor: "text-blue-500 bg-blue-100",
    },
  ];
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
