import { useEffect, useState } from "react";
import "@/style/CourseDetail.css";
import { fetchCourseById } from "@/app/api/course/CourseAPI";
import { Course } from "@/app/type/course/Course";
import { format } from "date-fns";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { addToCart } from "@/app/api/cart/cart";
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
interface CourseCardProps {
  courseId: string;
}

export default function CourseDetail({ courseId }: CourseCardProps) {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    intro: true,
    exam: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };
  const router = useRouter();
  const params = useParams();
  const handleClick = () => {
    const locale = params.locale;
    router.push(`/${locale}/showCourse/`);
  };
  const [courses, setCourses] = useState<Course | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: session } = useSession();
  const t = useTranslations("courseDetailForm");
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const token = session?.user.token;
        if (!token) {
          return
        }
        const data = await fetchCourseById(courseId, token);
        setCourses(data);
        console.log("Loaded courses:", data);
      } catch (error) {
        console.log("Loaded courses error:", error);
      } finally {
      }
    };

    loadCourses();
  }, [courseId, session]);

  const formatDate = (dateString: string) => {
    if (dateString) return format(new Date(dateString), "MMMM d, yyyy");
  };

  const handleAddToCart = async (courseId: string) => {
    try {
      const token = session?.user.token;
      const email = session?.user.email;
      if (!token || !courseId || !email) {
        NotificationManager.warning(t("loginRequired"), t("warning"), 2000);
        return;
      }

      const response = await addToCart(token, email, courseId);
      if (response.statusCode === 200) {
        NotificationManager.success(t("addedToCartSuccess"), t("success"), 2000);
      } else {
        NotificationManager.error(t("addedToCartFail"), t("error"), 2000);
      }
    } catch {
      NotificationManager.error(t("addedToCartFail"), t("error"), 2000);
    }
  };
  const handleCheckOut = () => {
    if (!courses) return;

    const locale = params.locale;
    const checkoutData = [{
      cart_id: courses.courseId,
      course_id: courses.courseId,
      user_id: session?.user?.id,
      user_name: session?.user?.name,
      course_title: courses.title,
      course_price: courses.price,
      course_img: courses.imageInfo || "",
    }];

    const encodedData = encodeURIComponent(JSON.stringify(checkoutData));

    router.push(`/${locale}/payment?data=${encodedData}`);
  };



  return (
    <div className="container">
      <div className="button-wrapper">
        <button onClick={handleClick} title="Go back">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-arrow-left"
            viewBox="0 0 16 16"
          >
            <path
              fill-rule="evenodd"
              d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"
            />
          </svg>
        </button>
      </div>

      <div className="course-header">
        <h1>{courses?.title}</h1>
        <div className="meta">
          <div className="avatar">
            <Image
              src={courses?.userAvata || ""}
              alt="Course Thumbnail"
              width={250}
              height={140}
              className="avatar-img"
            />
          </div>
          <div>
            <p>{t("teacher")}</p>
            <h3>{courses?.userName}</h3>
          </div>
          <div>
            <p>{t("category")}</p>
            <h3>{courses?.categoryName}</h3>
          </div>
          <div>
            <p>{t("lastUpdate")}</p>
            <h3>{formatDate(courses?.updatedAt || "")}</h3>
          </div>
          <div>
            <p>⭐⭐⭐⭐⭐</p>
            <h3>{t("rating")}:5/5</h3>
          </div>
        </div>
      </div>

      <div className="content-detailCourse">
        <div className="content-left">
          <div className="course-description">
            <h2>{t("aboutCourse")}</h2>
            <div
              className={`ql-editor ${isExpanded ? "expanded" : "collapsed"}`}
              dangerouslySetInnerHTML={{ __html: courses?.description ?? "" }}
            />
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="read-more-btn"
            >
              {isExpanded ? t("collapse") : t("readMore")}
            </button>
          </div>

          <div className="course-curriculum">
            <h2>{t("courseCurriculum")}</h2>

            <div className="curriculum-section">
              <h3
                onClick={() => toggleSection("intro")}
                className="section-title"
              >
                {t("inTroToCourse")} {expandedSections.intro ? "▼" : "▶"}
              </h3>
              {expandedSections.intro && (
                <ul>
                  <li>📹 Lesson 1: Video: Course Intro</li>
                  <li>📹 Lesson 2: Video: Course Intro</li>
                  <li>📹 Lesson 3: Video: Course Intro</li>
                  <li>📹 Lesson 4: Video: Course Intro</li>
                </ul>
              )}
            </div>

            <div className="curriculum-section">
              <h3
                onClick={() => toggleSection("exam")}
                className="section-title"
              >
                {t("exam")} {expandedSections.exam ? "▼" : "▶"}
              </h3>
              {expandedSections.exam && (
                <ul>
                  <li>✅ Final Exam Course</li>
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="course-sidebar">
          <iframe
            title="Course Video"
            width="100%"
            height="150"
            src={courses?.videoInfo}
            allowFullScreen
          ></iframe>

          <h2 className="course-price">${courses?.price}</h2>

          <button className="btn add-to-cart" onClick={() => handleAddToCart(courses?.courseId || "")}>{t("addToCart")}</button>
          <button className="btn buy-course" onClick={() => handleCheckOut()}>{t("buyCourse")}</button>

          <div className="course-details">
            <div className="row"></div>
            <div className="row"></div>
            <div className="row"></div>
            <div className="row"></div>
            <div className="row"></div>
          </div>
        </div>
      </div>
      <NotificationContainer />
    </div>
  );
}
