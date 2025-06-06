"use client";

import React, { useEffect, useState } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "components/ui/button";
import { CourseTable } from "components/course/columns";
import { useRouter } from "next/navigation";
import { deleteCourse, fetchCourses } from "app/api/courses/course";
import { useSession } from "next-auth/react";

export interface Course {
  courseId: string;
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
  const { data: session } = useSession();
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setIsLoading(true);
        if (!session?.accessToken) return;
        const data = await fetchCourses(session.accessToken);
        setCourses(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCourses();
  }, [courses, session]);

  const handleDelete = async (id: string) => {
    try {
      if (!session?.accessToken) return;
      await deleteCourse(id, session.accessToken);
      setCourses((prev) => prev.filter((c) => c.courseId !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = (id: string) => {
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
