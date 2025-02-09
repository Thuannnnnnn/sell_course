"use client";

import { fetchCoursePurchased } from "@/app/api/auth/User/route";
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
import { Container, Row, Col, Spinner, Nav } from "react-bootstrap";

interface User {
  id: string;
  email: string;
  name: string;
  avatarImg: string;
  gender: string;
  birthDay: string;
  phoneNumber: string;
  role: string;
}

const CoursePurchase: React.FC = () => {
  const [coursePurchased, setCoursePurchased] = useState<UserGetAllCoursePurchase[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const localActive = useLocale();
  const router = useRouter();
  const t = useTranslations("enrolledCourse");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (session?.user) {
      setUser(session?.user);
      if (session.user.token && session.user.email) {
        fetchCourseData(session.user.token, session.user.email);
      } else {
        setError("Token or email is missing.");
      }
    }
  }, [session, status]);

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
    } catch {
      setError("Có lỗi xảy ra khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Container>
      {user ? <BannerUser user={user} /> : <SignIn />}
      <div className="content-profile">
        <div className="dashboard">
          <DashBoardUser />
        </div>
        <div className="form-profile">
          <div className="form-header">
            <h2>{t("title")}</h2>
            <Nav variant="tabs">
              <Nav.Item>
                <Nav.Link eventKey="enrolled">{t("enrolledCourses")}</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="active">{t("activeCourses")}</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="completed">{t("completedCourse")}</Nav.Link>
              </Nav.Item>
            </Nav>
          </div>
          <div>
            {error ? (
              <div className="text-center py-4">
                <p className="text-danger">{error}</p>
                {!session && (
                  <button className="btn btn-primary mt-3" onClick={() => (window.location.href = "/login")}>
                    Đăng nhập
                  </button>
                )}
              </div>
            ) : coursePurchased.length > 0 ? (
              <Row className="mt-4">
                {coursePurchased.map((course) => (
                  <Col key={course.courseId} xs={12} sm={6} md={4} className="mb-4">
                    <div className="course-card" onClick={() => (window.location.href = `/course/${course.courseId}`)}>
                      <Image src={course.imageInfo} alt={course.title} width={200} height={120} className="course-image" />
                      <div className="course-content">
                        <p className="text-muted small">{course.categoryName}</p>
                        <div className="d-flex align-items-center mb-2">
                          <small>{course.title}</small>
                        </div>

                        <p className="small">Lessons</p>
                        <div className="d-flex align-items-center">
                          <span className="me-2">⭐⭐⭐⭐⭐</span>
                        </div>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted">Bạn chưa mua khóa học nào.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default CoursePurchase;
