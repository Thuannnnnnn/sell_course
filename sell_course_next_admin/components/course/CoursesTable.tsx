import React, { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { PlusCircle } from "lucide-react";
import { CourseTable } from "./columns";
import axios from "axios";
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
export function CoursePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
const router = useRouter()
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);

        const response = await axios.get(
          "http://localhost:8080/api/courses/getAll"
        );
        if (response.status === 404) {
          console.error("no courses found:", response.statusText);
          setError("no courses found");
        }
        setCourses(response.data);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("Failed to load courses. Please try again later.");
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
        setError("Failed to delete course. Please try again.");
      });
  };

  const handleUpdate = (id: number) => {
    console.log("Update course:", id);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

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
          <Button className="flex items-center gap-2" onClick={() => router.push("../forms/AddCourseForm.tsx")}>
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
