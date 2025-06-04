"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Sidebar } from "components/dashboard/Sidebar";
import { Button } from "components/ui/button";
import { CoursePage } from "components/course/CoursesTable";

export default function AdminCoursesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="flex flex-col md:ml-64 p-4 md:p-6 bg-background h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Course Management</h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Course
          </Button>
        </div>
        <CoursePage />
      </div>
    </div>
  );
}
