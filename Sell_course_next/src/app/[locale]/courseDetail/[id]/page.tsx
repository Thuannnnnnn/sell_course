"use client";
import React from "react";
import { useParams } from "next/navigation";
import CourseDetail from "@/components/course/courseDetail";
import Link from "next/link";
import { useLocale } from "next-intl";
export default function CourseDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const localActive = useLocale();
  return (
    <div>
      <CourseDetail courseId={id} />      {/* Thêm nút điều hướng sang CourseInfo */}
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <Link href={`/${localActive}/courseInfo/${id}`}>
          <button style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}>
            Go to Course Info
          </button>
        </Link>
      </div>
    </div>
  );
}
