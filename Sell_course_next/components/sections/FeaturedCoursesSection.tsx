"use client";

import React from "react";
import { CourseCard } from "../ui/CourseCard";
import { useHomeData } from "../../contexts/HomeDataContext";
import { CourseResponseDTO, CourseCardData } from "@/app/types/Course/Course";

// Transform backend course data to CourseCard format
const transformCourseData = (course: CourseResponseDTO): CourseCardData => {
  return {
    id: course.courseId,
    title: course.title,
    instructor: course.instructorName,
    price: `$${course.price.toFixed(2)}`,
    rating: course.rating,
    image: course.thumbnail || "/placeholder-course.jpg", // Fallback image
    description: course.short_description,
    level: course.level,
    duration: course.duration,
  };
};

export function FeaturedCoursesSection() {
  const { featuredCourses } = useHomeData();
  
  // Transform the courses data
  const courses = featuredCourses.map(transformCourseData);

  if (courses.length === 0) {
    return (
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50 flex items-center justify-center">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Popular Courses
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                No courses available at the moment
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50 flex items-center justify-center">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Popular Courses
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Explore our most popular courses and start learning today
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
}