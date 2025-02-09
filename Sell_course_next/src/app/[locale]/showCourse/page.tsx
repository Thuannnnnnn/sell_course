"use client";
import React, { useEffect, useState } from "react";
import CourseCard from "@/components/course/CourseCard";
import "@/style/CourseCard.css";
import { Course } from "@/app/type/course/Course";
import { fetchCourses } from "@/app/api/course/CourseAPI";
const AboutPage: React.FC = () => {

   const [courses, setCourses] = useState<Course[]>([]);
    const token = "your_auth_token_here";
  
    useEffect(() => {
      const loadCourses = async () => {
        try {
          const data = await fetchCourses(token);
          setCourses(data);
          console.log("Loaded courses:", data);
        } catch (error) {
          console.log("Loaded courses error:", error);
        } finally {
        }
      };
  
      loadCourses();
    }, [token]);
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "20px",
      }}
    >
      {courses.map((course) => (
        <CourseCard key={course.courseId} course={course} />
      ))}
    </div>
  );
};

export default AboutPage;
