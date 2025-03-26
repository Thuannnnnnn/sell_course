"use client";
import Sidebar from "@/components/SideBar";
import "../../../../style/Exam.css";
import { useEffect, useState } from "react";
import { fetchCoursesAdmin } from "@/app/api/course/CourseAPI";
import { useTranslations } from "next-intl";
import { Course } from "@/app/type/course/Course";
import { useSession } from "next-auth/react";
import ExamList from "@/components/exam/CourseExam";
export default function CoursePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const t = useTranslations("courses");
  const { data: session } = useSession();

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const token = session?.user.token;
        if (!token) {
          return;
        }
        const data = await fetchCoursesAdmin(token);
        setCourses(data);
        console.log("Loaded courses:", data);
      } catch (error) {
        console.log("Loaded courses error:", error);
      } finally {
      }
    };

    loadCourses();
  }, [session]);

  return (
    <div className="d-flex margin3rem">
      <div className="sidebar-page">
        <Sidebar />
      </div>
      <div className="layout-right">
        <div className="layout-rightHeader">
          <h3>{t("course")}</h3>
        </div>
        <ExamList courses={courses} setCourses={setCourses} />
      </div>
    </div>
  );
}
