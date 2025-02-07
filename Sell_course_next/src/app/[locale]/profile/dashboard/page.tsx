"use client";

import { fetchCoursePurchased, getUserId } from "@/app/api/auth/User/route";
import { UserGetAllCoursePurchase } from "@/app/type/user/User";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const CoursePurchase: React.FC = () => {
  const [coursePurchased, setCoursePurchased] = useState<
    UserGetAllCoursePurchase[]
  >([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = session?.user?.token;
        console.log("Token:", token);

        if (!token) {
          setError("Bạn cần đăng nhập để xem khóa học đã mua.");
          setLoading(false);
          return;
        }

        console.log("Đang gọi getUserId");
        const userId = await getUserId(token);
        console.log("userId từ API:", userId);

        if (!userId) {
          console.log("userId không tồn tại");
          setError("Không thể lấy thông tin người dùng.");
          setLoading(false);
          return;
        }

        console.log("Đang gọi fetchCoursePurchased với userId:", userId);
        const courses = await fetchCoursePurchased(token, userId);
        console.log("Kết quả courses:", courses);

        if (courses && courses.length > 0) {
          setCoursePurchased(courses);
          setError("");
        } else {
          setCoursePurchased([]);
        }
      } catch (error: any) {
        console.error("Chi tiết lỗi:", {
          message: error.message,
          error: error,
        });
        setError(error.message || "Có lỗi xảy ra khi tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchData();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Khóa học đã mua</h2>
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
          {!session && (
            <button
              className="mt-4 bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors duration-300"
              onClick={() => (window.location.href = "/login")}
            >
              Đăng nhập
            </button>
          )}
        </div>
      ) : coursePurchased.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coursePurchased.map((course) => (
            <div
              key={course.courseId}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              {course.imageInfo && (
                <img
                  src={course.imageInfo}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                  {course.title}
                </h3>
                <div className="text-sm text-gray-600">
                  <p className="mb-1">
                    <span className="font-medium">Danh mục:</span>{" "}
                    {course.categoryName}
                  </p>
                  <p className="mb-1">
                    <span className="font-medium">Mã khóa học:</span>{" "}
                    {course.courseId}
                  </p>
                </div>
                <button
                  className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300"
                  onClick={() =>
                    (window.location.href = `/course/${course.courseId}`)
                  }
                >
                  Xem khóa học
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600">Bạn chưa mua khóa học nào.</p>
          <button
            className="mt-4 bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors duration-300"
            onClick={() => (window.location.href = "/courses")}
          >
            Khám phá khóa học
          </button>
        </div>
      )}
    </div>
  );
};
export default CoursePurchase;
