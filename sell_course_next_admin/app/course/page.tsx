"use client";

import React, { useEffect, useState } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "components/ui/button";
import { CourseTable } from "components/course/columns";
import { useRouter } from "next/navigation";
import { deleteCourse, fetchCourses } from "app/api/courses/course";

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
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setIsLoading(true);
        const data = await fetchCourses();
        setCourses(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCourses();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await deleteCourse(id);
      setCourses((prev) => prev.filter((c) => c.courseId !== id));
    } catch (err) {
      console.error(err);
    }
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
  );
}
