"use client";

import React, { useEffect, useState } from "react";
import { PlusCircle } from "lucide-react";
import { Sidebar } from "components/dashboard/Sidebar";
import { Button } from "components/ui/button";
import axios from "axios";
import { CourseTable } from "components/course/columns";
import { useRouter } from "next/navigation";

export interface Course {
  courseId: number;
  title: string;
  category: string;
  thumbnail: string;
  price: number;
  status: "Published" | "Draft" | "Pending" | "Processing" | "Rejected";
  updatedAt: string;
}

export default function AdminCoursesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);

        const response = await axios.get(
          "http://localhost:8080/api/courses/getAll"
        );
        if (response.status === 404) {
          console.error("no courses found:", response.statusText);
        }
        setCourses(response.data);
      } catch (err) {
        console.error("Error fetching courses:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleDelete = (id: number) => {
    axios
      .delete(`http://localhost:8080/api/courses/${id}`)
      .then(() => {
        setCourses(courses.filter((course) => course.courseId !== id));
      })
      .catch((err) => {
        console.error("Error deleting course:", err);
      });
  };

  const handleUpdate = (id: number) => {
    console.log("Update course:", id);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div>Loading courses...</div>
      </div>
    );
  }

  return (
    <div>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="flex flex-col md:ml-64 p-4 md:p-6 bg-background h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Courses</h2>
                <p className="text-muted-foreground">
                  Manage your course catalog here.
                </p>
              </div>
              <Button
                className="flex items-center gap-2"
                onClick={() => router.push("/course/add")}
              >
                <PlusCircle className="h-5 w-5" />
                Create Course
              </Button>
            </div>
            <CourseTable
              courses={courses}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
