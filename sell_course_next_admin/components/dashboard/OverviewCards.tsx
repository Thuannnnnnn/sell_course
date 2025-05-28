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
export function OverviewCards() {
  const stats = [
    {
      title: "Monthly Revenue",
      value: "$12,426",
      change: "+12%",
      increasing: true,
      icon: DollarSign,
      iconColor: "text-green-500",
    },
    {
      title: "Total Orders",
      value: "1,234",
      change: "+8%",
      increasing: true,
      icon: ShoppingCart,
      iconColor: "text-blue-500",
    },
    {
      title: "New Students",
      value: "356",
      change: "+24%",
      increasing: true,
      icon: Users,
      iconColor: "text-purple-500",
    },
    {
      title: "Active Courses",
      value: "28",
      change: "-2%",
      increasing: false,
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
