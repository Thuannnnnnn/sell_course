"use client";
import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { OverviewCards } from "./OverviewCards";
import { Analytics } from "./Analytics";
import { CourseList } from "./CourseList";
import { ActivityFeed } from "./ActivityFeed";

export function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex h-screen bg-background">
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transition-transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      </div>
      <div className="flex-1 flex flex-col md:ml-64 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
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
            <div className="mt-6">
              <CourseList />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
