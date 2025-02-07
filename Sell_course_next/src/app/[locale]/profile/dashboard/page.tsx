"use client";

import { fetchCoursePurchased } from "@/app/api/auth/User/route";
import { UserGetAllCoursePurchase } from "@/app/type/user/User";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const CoursePurchase: React.FC = () => {
  const { user_id } = useParams(); // Lấy user_id từ URL
  const [coursePurchased, setCoursePurchased] = useState<UserGetAllCoursePurchase[]>([]);

  useEffect(() => {
    const token = sessionStorage.getItem('token')

    if (!token) {
      console.error("No token found! User might not be authenticated.");
      return;
    }

    if (!user_id) {
      console.error("No user_id found in URL.");
      return;
    }

    console.log("Fetching courses for user:", user_id, "with token:", token);

    fetchCoursePurchased(token, user_id)
      .then((data) => setCoursePurchased(data || []))
      .catch((error) => console.error("Error fetching purchased courses:", error));
  }, [user_id]);

  return (
    <div>
      <h2>Purchased Courses</h2>
      {coursePurchased.length > 0 ? (
        <ul>
          {coursePurchased.map((course) => (
            <li key={course.courseId}>{course.title}</li>
          ))}
        </ul>
      ) : (
        <p>No courses purchased yet.</p>
      )}
    </div>
  );
};

export default CoursePurchase;
