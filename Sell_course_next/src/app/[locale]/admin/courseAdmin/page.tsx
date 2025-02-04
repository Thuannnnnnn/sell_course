"use client";
import Sidebar from "@/components/SideBar";
import { useEffect, useState } from "react";
import { fetchCourses } from "@/app/api/course/CourseAPI";
import CourseList from "@/components/course/courseListAdmin";
import "../../../../style/course/courseAdmin.css";
import { useTranslations } from "next-intl";
import { Course } from "@/app/type/course/Course";
import { Button } from "react-bootstrap";

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
        <div className="layout-rightHeader">
          <h3>{t("course")}</h3>
          <Button className="button-create">
            <span className="icon">+</span>
            {t("create")}
          </Button>
        </div>
        <CourseList courses={courses} setCourses={setCourses} />
      </div>
    </div>
  );
}
