"use client";

import React from "react";
import "@/style/course/courseAdmin.css";
import { Course } from "@/app/type/course/Course";
import { deleteCourse } from "@/app/api/course/CourseAPI";
import { Container } from "react-bootstrap";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
interface CourseListProps {
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
}

const CourseList: React.FC<CourseListProps> = ({ courses, setCourses }) => {
  const t = useTranslations("courses");
  const token = "your_auth_token_here";
  const router = useRouter();
  const handleDelete = async (courseId: string) => {
    try {
      await deleteCourse(courseId, token);
      setCourses((prev) =>
        prev.filter((course) => course.courseId !== courseId)
      );
    } catch (error) {
      console.error("Failed to delete course: ", error);
      alert("Failed to delete course.");
    }
  };

  return (
    <Container className="course-table">
      <table>
        <thead>
          <tr>
            <th></th>
            <th>{t("thumbnail")}</th>
            <th>{t("title")}</th>
            <th>{t("category")}</th>
            <th>{t("author")}</th>
            <th>{t("dateCreated")}</th>
            <th>{t("actions")}</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course, index) => (
            <tr key={course.courseId}>
              <td>{index + 1}</td>
              <td>
                {course.imageInfo ? (
                  <Image
                    src={course.imageInfo}
                    alt="Course Thumbnail"
                    width={50}
                    height={50}
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  "N/A"
                )}
              </td>
              <td>{course.title}</td>
              <td>{course.categoryName || "N/A"}</td>
              <td>{course.userName || "N/A"}</td>
              <td>
                {course.createdAt
                  ? new Date(course.createdAt).toLocaleDateString()
                  : "N/A"}
              </td>
              <td>
                <button
                  onClick={() =>
                    router.push(`/vn/admin/courseAdmin/edit/${course.courseId}`)
                  }
                  style={{ marginRight: "10px" }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    className="bi bi-pencil-square"
                    viewBox="0 0 16 16"
                  >
                    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                    <path d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z" />
                  </svg>
                </button>
                <button onClick={() => handleDelete(course.courseId)}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    className="bi bi-trash"
                    viewBox="0 0 16 16"
                  >
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Container>
  );
};

export default CourseList;
