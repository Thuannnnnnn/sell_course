"use client";
import Sidebar from "@/components/SideBar";
import { useEffect, useState } from "react";
import { fetchCourses } from "@/app/api/course/CourseAPI";
import CourseList from "@/components/course/courseListAdmin";
import "../../../../style/course/courseAdmin.css";
import { useTranslations } from "next-intl";
import { Course } from "@/app/type/course/Course";
import { Button } from "react-bootstrap";
import { useRouter } from "next/navigation";
export default function CoursePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const t = useTranslations("courses");
  const token = "your_auth_token_here";

  const router = useRouter();
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
    <div className="d-flex">
      <div className="sidebar-page">
        <Sidebar />
      </div>
      <div className="layout-right">
        <div className="layout-rightHeader">
          <h3>{t("course")}</h3>
          <Button
            className="button-create"
            onClick={() => router.push("courseAdmin/add")}
          >
            <span className="icon">+</span>
            {t("create")}
          </Button>
        </div>
        <CourseList courses={courses} setCourses={setCourses} />
      </div>
    </div>
  );
}
