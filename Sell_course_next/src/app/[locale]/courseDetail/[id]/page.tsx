"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CourseDetail from "@/components/course/courseDetail";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { CoursePurchaseAPI } from "@/app/api/coursePurchased/coursePurchased";
export default function CourseDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const localActive = useLocale();
  const [hasCompleted, setHasCompleted] = useState<boolean>(false);
  const { data: session } = useSession();
  const email = session?.user.email || "";
  useEffect(() => {
    const handleCoursePurchase = async () => {
      let data;
      if (email) {
        data = await CoursePurchaseAPI.getCoursePurchaseById(id, email);
      } else {
        data = 404;
      }
      if (data === 200) {
        setHasCompleted(true);
      }
    };
    handleCoursePurchase();
  }, [id, email]);
  return (
    <div>
      <CourseDetail courseId={id} /> {/* Thêm nút điều hướng sang CourseInfo */}
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        {hasCompleted && (
          <Link href={`/${localActive}/courseInfo/${id}`}>
            <button
              style={{
                padding: "10px 20px",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              Go to Course Info
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}
