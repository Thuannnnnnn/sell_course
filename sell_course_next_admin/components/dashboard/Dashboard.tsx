"use client";
import React from "react";
import { OverviewCards } from "./OverviewCards";
import { Analytics } from "./Analytics";
import { ActivityFeed } from "./ActivityFeed";

export function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <OverviewCards />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <Analytics />
        </div>
        <div>
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
