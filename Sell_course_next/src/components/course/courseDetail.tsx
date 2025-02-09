import { useEffect, useState } from "react";
import "@/style/CourseDetail.css";
import { fetchCourseById } from "@/app/api/course/CourseAPI";
import { Course } from "@/app/type/course/Course";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { addToCart } from "@/app/api/cart/cart";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import "react-notifications/lib/notifications.css";
import { ResponseQaDto } from "@/app/type/qa/Qa";
import { getAllQa } from "@/app/api/qa/Qa";

const getRelativeTime = (dateString: string) => {
  const now = new Date();
  const past = new Date(dateString);

  const diffInMilliseconds = now.getTime() - past.getTime();
  const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInSeconds < 30) return "Just now";
  if (diffInSeconds < 60)
    return `${diffInSeconds} second${diffInSeconds > 1 ? "s" : ""} ago`;
  if (diffInMinutes < 60)
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  if (diffInHours < 24)
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 30)
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  if (diffInMonths < 12)
    return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
  return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`;
};

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
  const [qaData, setQaData] = useState<ResponseQaDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReplyPopup, setShowReplyPopup] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    null
  );
  const [replyText, setReplyText] = useState("");
  const t = useTranslations("courseDetailForm");

  useEffect(() => {
    const fetchQaData = async () => {
      if (!courseId) return;

      setLoading(true);
      try {
        const data = await getAllQa(courseId);
        setQaData(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching QA:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch QA data"
        );
        setQaData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQaData();
  }, [courseId]);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const token = session?.user.token;
        if (!token) {
          return;
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
    return new Date(dateString).toLocaleDateString();
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
        NotificationManager.success(
          t("addedToCartSuccess"),
          t("success"),
          2000
        );
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
    const checkoutData = [
      {
        cart_id: courses.courseId,
        course_id: courses.courseId,
        user_id: session?.user?.id,
        user_name: session?.user?.name,
        course_title: courses.title,
        course_price: courses.price,
        course_img: courses.imageInfo || "",
      },
    ];

    const encodedData = encodeURIComponent(JSON.stringify(checkoutData));

    router.push(`/${locale}/payment?data=${encodedData}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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

          <div className="course-qa bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold mb-6">
              {t("questionsAndAnswers")}
            </h2>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            {qaData.length > 0 ? (
              <div className="qa-list space-y-6">
                {qaData
                  .filter((qa) => !qa.parentId)
                  .map((question) => {
                    const answers = qaData.filter(
                      (qa) => qa.parentId === question.qaId
                    );
                    return (
                      <div
                        key={question.qaId}
                        className="qa-item border-b pb-4 last:border-b-0"
                      >
                        <div className="question bg-gray-50 p-4 rounded-lg">
                          <div className="userContent flex items-start gap-3">
                            {question.avatarImg && (
                              <Image
                                src={question.avatarImg}
                                alt="User Avatar"
                                width={40}
                                height={40}
                                className="rounded-circle"
                              />
                            )}
                            <div>
                              <h4 className="font-semibold text-lg flex items-center gap-2 flex items-center gap-2">
                                {question.username}
                                <span className="dateTime text-sm text-gray-500 font-normal">
                                  {getRelativeTime(question.createdAt)}
                                </span>
                              </h4>
                              <p className="textQuestion mt-2 text-gray-700">
                                {question.text}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedQuestionId(question.qaId);
                              setShowReplyPopup(true);
                            }}
                            className="mt-2 text-blue-600 hover:text-blue-800 font-medium buttonReply"
                          >
                            {t("reply")}
                          </button>
                        </div>
                        {answers.map((answer) => (
                          <div
                            key={answer.qaId}
                            className="answer ml-8 mt-4 bg-blue-50 p-4 rounded-lg"
                          >
                            <p className="text-lg mb-2">A: {answer.text}</p>
                          </div>
                        ))}
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                {t("noQuestionsYet")}
              </p>
            )}
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

          <button
            className="btn add-to-cart"
            onClick={() => handleAddToCart(courses?.courseId || "")}
          >
            {t("addToCart")}
          </button>
          <button className="btn buy-course" onClick={() => handleCheckOut()}>
            {t("buyCourse")}
          </button>

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
