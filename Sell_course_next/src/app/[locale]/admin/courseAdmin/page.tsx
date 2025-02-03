"use client";
import Sidebar from "@/components/SideBar";
import { useEffect, useState } from "react";
import { fetchCourses } from "@/app/api/course/CourseAPI";
import CourseList from "@/components/course/courseListAdmin";
import "../../../../style/courseAdmin.css";
import { useTranslations } from "next-intl";
import { Course } from "@/app/type/course/Course";

export default function CoursePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("courses");
  const token = "your_auth_token_here";

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const data = await fetchCourses(token);
        setCourses(data);
        console.log("Loaded courses:", data);
      } catch (error) {
        setError("Failed to load courses. " + error);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [token]);

  if (loading) return <p>Loading courses...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="d-flex">
      <div className="sidebar-page">
        <Sidebar />
      </div>
      <div className="layout-right">
        <h3>{t("course")}</h3>
        <CourseList courses={courses} setCourses={setCourses} />
      </div>
    </div>
  );
}
