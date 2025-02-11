"use client";

import { fetchCoursePurchased } from "@/app/api/auth/User/user";
import { UserGetAllCoursePurchase } from "@/app/type/user/User";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import DashBoardUser from "@/components/DashBoardUser";
import BannerUser from "@/components/BannerUser";
import SignIn from "../../../auth/login/page";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import "../../../../../style/UserProfilePage.css";

interface User {
  id: string;
  email: string;
  name: string;
  avatarImg: string;
  gender: string;
  birthDay: string;
  phoneNumber: string;
  role: string;
  user_id: string;
  username: string;
}

const CoursePurchase: React.FC = () => {
  const [coursePurchased, setCoursePurchased] = useState<UserGetAllCoursePurchase[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const localActive = useLocale();
  const router = useRouter();
  const t = useTranslations('enrolledCourse')

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (session?.user) {
      const user: User = {
        id: session.user.id || "",
        email: session.user.email || "",
        name: session.user.name || "",
        avatarImg: session.user.avatarImg || "",
        gender: session.user.gender || "",
        birthDay: session.user.birthDay || "",
        phoneNumber: session.user.phoneNumber || "",
        role: session.user.role || "",
        user_id: "",
        username: ""
      };
      setUser(user);
      if (session.user.token && session.user.email) {
        fetchCourseData(session.user.token, session.user.email);
      } else {
        setError("Token or email is missing.");
      }
    }
  }, [router, session, status]);

  const fetchCourseData = async (token: string, email: string) => {
    setLoading(true);
    try {
      if (!token || !email) {
        setError("Bạn cần đăng nhập để xem khóa học đã mua.");
        return;
      }

      const courses = await fetchCoursePurchased(token, email);
      setCoursePurchased(courses ?? []);
      setError("");
    } catch (error) {
      console.error("Chi tiết lỗi:", error);
      setError(String(error))
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <div>{user ? <BannerUser user={user} /> : <SignIn />}</div>
      <div className="content-profile">
        <div className="dashboard">
          <DashBoardUser />
        </div>
        <div className="form-profile">
          <div className="form-header">
            <h2>{t('title')}</h2>
            <div className="link">
              <Link className="link-profile" href={`/${localActive}/profile/dashborad/enrolledCourse`}>
                <h6 className="active">{t('enrolledCourses')}</h6>
              </Link>
              <Link className="link-profile" href={`/${localActive}/profile/dashborad/activeCourse`}>
                <h6>{t('activeCourses')}</h6>
              </Link>
              <Link className="link-profile" href={`/${localActive}/profile/dashborad/completeCourse`}>
                <h6>{t('compeltedCourse')}</h6>
              </Link>
            </div>
          </div>
          <div>
            <div>
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
                <div className="cardAll">
                  {coursePurchased.map((course) => (
                    <div className="cardEnrolled" key={course.courseId}>
                      <div onClick={() =>
                        (window.location.href = `/course/${course.courseId}`)
                      }
                        key={course.courseId}
                        className="cardContent"
                      >
                        {course.imageInfo && (
                          <Image
                            src={course.imageInfo}
                            alt={course.title}
                            className="cardImg"
                            width={100}
                            height={100}
                          />
                        )}
                        <div className="cardInfo">
                          <p className="cardCategory">
                            {course.categoryName}
                          </p>
                          <div className="cardTitle">
                            <h3 className="">
                              {course.title}
                            </h3>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">{t('noCourse')}</p>
                  {/* <button
                      className="mt-4 bg-blue-600 text-black py-2 px-6 rounded-md hover:bg-blue-700 transition-colors duration-300"
                      onClick={() => (window.location.href = "/courses")}
                    >
                      Khám phá khóa học
                    </button> */}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CoursePurchase;
