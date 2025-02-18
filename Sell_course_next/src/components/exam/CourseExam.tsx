"use client";

import React from "react";
import '../../style/Exam.css'
import { Course } from "@/app/type/course/Course";
import { Container } from "react-bootstrap";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
interface CourseListProps {
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
}

const ExamList: React.FC<CourseListProps> = ({ courses }) => {
  const t = useTranslations("courses");
  const { data: session } = useSession();
  const router = useRouter();

  if(!session?.user.token) return;

  return (
    <Container className="course-table">
      <div>
        <div>
          {courses.map((course, index) => (
            <div key={course.courseId} >
            <div className="exCourse" onClick={() => router.push(`/vn/admin/exam/${course.courseId}`)}>
              <div>{index + 1}</div>
              <div>
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
              </div>
              <div>{course.title}</div>
              <div>
                {course.createdAt
                  ? new Date(course.createdAt).toLocaleDateString()
                  : "N/A"}
              </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
};

export default ExamList;
