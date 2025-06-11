import React from "react";
import { CourseItem } from "./CourseItem";
interface Course {
  id: string;
  title: string;
  instructor: string;
  duration: string;
  price: number;
  image: string;
  originalPrice?: number;
}
interface CourseListProps {
  courses: Course[];
}
export function CourseList({ courses }: CourseListProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {courses.map((course) => (
          <CourseItem key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
