import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { PlusCircle } from "lucide-react";
import { CourseTable } from "./columns";


const MOCK_COURSES = [
  {
    id: 1,
    title: "Complete Web Development Bootcamp",
    category: "Web Development",
    thumbnail: "",
    price: 89.99,
    status: "Published",
    updatedAt: "1/20/2024",
  },
  {
    id: 2,
    title: "Python for Data Science",
    category: "Data Science",
    thumbnail: "",
    price: 94.99,
    status: "Published",
    updatedAt: "1/20/2024",
  },
  {
    id: 3,
    title: "Mobile App Development with React Native",
    category: "Mobile Development",
    thumbnail: "",
    price: 79.99,
    status: "Draft",
    updatedAt: "1/20/2024",
  },
  {
    id: 4,
    title: "UI/UX Design Fundamentals",
    category: "UI/UX Design",
    thumbnail: "",
    price: 69.99,
    status: "Published",
    updatedAt: "1/20/2024",
  },
  {
    id: 5,
    title: "Machine Learning Basics",
    category: "Machine Learning",
    thumbnail: "",
    price: 99.99,
    status: "Published",
    updatedAt: "1/20/2024",
  },
  {
    id: 6,
    title: "Machine Learning Basics1",
    category: "Machine Learning",
    thumbnail: "",
    price: 99.99,
    status: "Published",
    updatedAt: "1/20/2024",
  },
  {
    id: 7,
    title: "Machine Learning Basics2",
    category: "Machine Learning",
    thumbnail: "",
    price: 99.99,
    status: "Published",
    updatedAt: "1/20/2024",
  },
  {
    id: 8,
    title: "Machine Learning Basics3",
    category: "Machine Learning",
    thumbnail: "",
    price: 99.99,
    status: "Published",
    updatedAt: "1/20/2024",
  },
  {
    id: 9,
    title: "Machine Learning Basics4",
    category: "Machine Learning",
    thumbnail: "",
    price: 99.99,
    status: "Published",
    updatedAt: "1/20/2024",
  },
];
export function CoursePage() {
  const [courses, setCourses] = useState(MOCK_COURSES);
  const handleDelete = (id: number) => {
    setCourses(courses.filter((course) => course.id !== id));
  };
  const handleUpdate = (id: number) => {
    console.log("Update course:", id);
    // Implement update logic
  };
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
          <Button className="flex items-center gap-2">
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
