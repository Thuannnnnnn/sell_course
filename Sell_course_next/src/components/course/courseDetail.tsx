import { useEffect, useState } from "react";
import "@/style/CourseDetail.css";
import { fetchCourseById } from "@/app/api/course/CourseAPI";
import { Course } from "@/app/type/course/Course";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { addToCart } from "@/app/api/cart/cart";
import "react-quill/dist/quill.snow.css";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import "react-notifications/lib/notifications.css";
import { ResponseQaDto } from "@/app/type/qa/Qa";
import { createQa, deleteQa, getAllQa } from "@/app/api/qa/Qa";
import ReactQuill from "react-quill";
import {
  getFeedbackRatingByCourseId,
  createFeedbackRating,
  deleteFeedbackRating,
} from "@/app/api/feedbackRating/feedbackRating";
import { ResponseFeedbackRatingDto } from "@/app/type/feedbackRating/feedbackRating";
import { CoursePurchaseAPI } from "@/app/api/coursePurchased/coursePurchased";
import { creatWaitingList } from "@/app/api/waitingList/waitingList";
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
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState<ResponseFeedbackRatingDto[]>([]);
  const [newFeedback, setNewFeedback] = useState("");
  const [newStar, setNewStar] = useState(5);
  const [isPurchased, setIsPurchased] = useState(false);
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
    const handleCoursePurchase = async (courseId: string) => {
      if (!session?.user.email) return;

      try {
        const data = await CoursePurchaseAPI.getCoursePurchaseById(
          courseId,
          session?.user.email
        );
        if (data === 200) {
          setIsPurchased(true);
          return;
        }
      } catch (error) {
        console.error("Error fetching course purchase:", error);
      }
    };
    handleCoursePurchase(courseId);
    fetchQaData();
  }, [courseId, session]);

  const handleCreatWaitList = async () => {
    try {
      const token = session?.user.token;
      const userId = session?.user.user_id;
      if (!token || !userId) {
        NotificationManager.warning("Login required", "Warning", 2000);
        return;
      }

      const response = await creatWaitingList(token, userId, courseId);
      console.log("📩 API Response:", response);

      // Sửa kiểm tra status đúng với Axios
      if (response && response.waitlistId) {
        NotificationManager.success("Added to waitlist", "Success", 2000);
      } else {
        NotificationManager.error("Failed to add to waitlist", "Error", 2000);
      }
    } catch {
      NotificationManager.error("Failed to add to waitlist", "Error", 2000);
    }
  };
  useEffect(() => {
    const fetchFeedbackRatings = async () => {
      if (!courseId) return;
      try {
        const ratings = await getFeedbackRatingByCourseId(courseId);
        console.log("Fetched Feedbacks:", ratings);
        setFeedbacks(Array.isArray(ratings) ? ratings : [ratings]);
      } catch (error) {
        console.error("Error fetching feedback ratings:", error);
      }
    };
    fetchFeedbackRatings();
  }, [courseId]);

  const handleSubmitFeedback = async () => {
    if (!session || !session.user || !session.user.user_id) {
      NotificationManager.warning(
        t("loginRequired") || "You need to log in to submit feedback.",
        t("warning") || "Warning",
        2000
      );
      return;
    }

    if (!newFeedback.trim()) {
      NotificationManager.error(
        "Feedback cannot be empty",
        t("error") || "Error",
        2000
      );
      return;
    }

    if (newStar < 1 || newStar > 5) {
      NotificationManager.error(
        "Rating must be between 1 and 5 stars",
        t("error") || "Error",
        2000
      );
      return;
    }

    try {
      const userId = String(session.user.user_id);
      const existingFeedback = feedbacks.find(
        (fb) => fb.user && String(fb.user.user_id) === userId
      );

      if (existingFeedback) {
        console.log("Updating existing feedback...");

        setFeedbacks((prev) =>
          prev.map((fb) =>
            fb.user && String(fb.user.user_id) === userId
              ? { ...fb, star: newStar, feedback: newFeedback }
              : fb
          )
        );
        NotificationManager.success(
          "Feedback updated successfully",
          t("success") || "Success",
          2000
        );
      } else {
        console.log("Creating new feedback...");
        const feedback = await createFeedbackRating(
          userId,
          courseId,
          newStar,
          newFeedback,
          session.user.token
        );

        setFeedbacks((prev) => [feedback, ...prev]);
        NotificationManager.success(
          "Feedback submitted successfully",
          t("success") || "Success",
          2000
        );
      }

      setNewFeedback("");
      setNewStar(5);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      NotificationManager.error(
        "Failed to submit feedback",
        t("error") || "Error",
        2000
      );
    }
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    if (!session) {
      NotificationManager.warning(
        "You need to log in to delete feedback.",
        t("warning") || "Warning",
        2000
      );
      return;
    }
    if (!confirm("Are you sure you want to delete this feedback?")) return;
    try {
      await deleteFeedbackRating(feedbackId, session.user.token);
      setFeedbacks((prev) =>
        prev.filter((fb) => fb.feedbackRattingId !== feedbackId)
      );
      NotificationManager.success(
        "Feedback deleted successfully",
        t("success") || "Success",
        2000
      );
    } catch (error) {
      console.error("Error deleting feedback:", error);
      NotificationManager.error(
        "Failed to delete feedback",
        t("error") || "Error",
        2000
      );
    }
  };
  useEffect(() => {
    if (session?.user?.user_id && feedbacks.length > 0) {
      const currentUserFeedback = feedbacks.find(
        (fb) =>
          fb.user && String(fb.user.user_id) === String(session.user.user_id)
      );
      if (currentUserFeedback) {
        setNewFeedback(currentUserFeedback.feedback || "");
        setNewStar(currentUserFeedback.star || 5);
      }
    }
  }, [feedbacks, session]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error]);
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await fetchCourseById(courseId);
        setCourses(data);
        console.log("Loaded courses:", data);
      } catch (error) {
        console.log("Loaded courses error:", error);
      } finally {
      }
    };
    loadCourses();
  }, [courseId]);

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
  const handleCreateQa = async () => {
    if (!text.trim()) {
      setError("Nội dung câu hỏi không được để trống!");
      return;
    }

    setLoading(true);
    try {
      if (session?.user.email) {
        const newQa = await createQa(session?.user.email, courseId, text);
        setQaData((prevQa) => [newQa, ...prevQa]);
        setText("");
        setError(null);
      } else {
        setError("Bạn phải đăng kí để có thể Q&A");
      }
    } catch (error) {
      setError("Không thể tạo câu hỏi. Vui lòng thử lại!" + error);
    }
    setLoading(false);
  };

  const handleDeleteQa = async (qaId: string, email: string) => {
    if (!confirm("Bạn có chắc chắn muốn xoá câu hỏi này?")) return;
    try {
      if (email?.toLowerCase() === session?.user?.email?.toLowerCase()) {
        await deleteQa(qaId);
        setQaData((prevQa) => prevQa.filter((qa) => qa.qaId !== qaId));
      } else {
        setError("Bạn không có quyền xoá câu hỏi này");
      }
    } catch (error) {
      setError("Không thể xoá câu hỏi." + error);
    }
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleGotoCourse = () => {
    const locale = params.locale;
    router.push(`/${locale}/courseInfo/${courseId}`);
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

          <div className="feedback-section">
            <h2>Feedbacks</h2>
            {isPurchased ? (
              <div className="feedback-input-container">
                <textarea
                  value={newFeedback}
                  onChange={(e) => setNewFeedback(e.target.value)}
                  placeholder="Share your experience..."
                  className="feedback-textarea"
                />
                <div className="rating-container">
                  <span>Rating</span>
                  <div className="star-rating">
                    {Array.from({ length: 5 }, (_, index) => (
                      <span
                        key={index}
                        className={`star ${index < newStar ? "filled" : ""}`}
                        onClick={() => setNewStar(index + 1)}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  className="submit-feedback-btn"
                  onClick={handleSubmitFeedback}
                >
                  Submit Feedback
                </button>
              </div>
            ) : (
              <p>{t("purFedback")}</p>
            )}

            {feedbacks.length > 0 ? (
              feedbacks
                .slice() // Tạo bản sao để không ảnh hưởng mảng gốc
                .sort((a, b) => {
                  const currentUserId = session?.user?.user_id;
                  const isACurrentUser =
                    a.user && String(a.user.user_id) === String(currentUserId);
                  const isBCurrentUser =
                    b.user && String(b.user.user_id) === String(currentUserId);
                  return isBCurrentUser ? 1 : isACurrentUser ? -1 : 0; // Đưa feedback của user hiện tại lên đầu
                })
                .map((feedback) => (
                  <div
                    key={feedback.feedbackRattingId}
                    className="feedback-card"
                  >
                    <div className="feedback-header">
                      <div className="feedback-user-info">
                        {feedback.user?.avatarImg ? (
                          <Image
                            src={feedback.user.avatarImg}
                            alt="User Avatar"
                            width={32}
                            height={32}
                            className="feedback-avatar"
                          />
                        ) : (
                          <div className="feedback-avatar-placeholder">
                            {feedback.user?.username?.charAt(0) || "A"}
                          </div>
                        )}
                        <div className="feedback-user-details">
                          <span className="feedback-author">
                            {feedback.user?.username || "Anonymous"}
                          </span>
                          <span className="feedback-role">
                            {feedback.user?.role || "No Role"}
                          </span>
                        </div>
                      </div>
                      <button
                        className="delete-feedback-btn"
                        onClick={() =>
                          handleDeleteFeedback(feedback.feedbackRattingId)
                        }
                        title="Delete Feedback"
                      >
                        🗑️
                      </button>
                    </div>
                    <p className="feedback-text">{feedback.feedback}</p>
                    <div className="feedback-rating">
                      {Array.from({ length: 5 }, (_, index) => (
                        <span
                          key={index}
                          className={`star ${
                            index < feedback.star ? "filled" : ""
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                ))
            ) : (
              <p>No feedbacks yet</p>
            )}
          </div>

          <div className="course-qa bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold mb-6">
              {t("questionsAndAnswers")}
            </h2>
            <ReactQuill
              value={text}
              onChange={setText}
              theme="snow"
              placeholder={t("enterDescription")}
              className="quill"
              style={{ margin: "10px" }}
            />
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            <button
              onClick={handleCreateQa}
              className="m-2 bg-primary text-white px-4 py-2 rounded"
              disabled={loading}
            >
              {loading ? "Đang gửi..." : "Gửi câu hỏi"}
            </button>
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
                                {/* <span className="dateTime text-sm text-gray-500 font-normal">
                                  {getRelativeTime(question.createdAt)}
                                </span> */}
                              </h4>
                              <p className="textQuestion mt-2 text-gray-700">
                                <div
                                  className={`ql-editor ${
                                    isExpanded ? "expanded" : "collapsed"
                                  }`}
                                  dangerouslySetInnerHTML={{
                                    __html: question.text ?? "",
                                  }}
                                />
                              </p>
                              <button
                                onClick={() =>
                                  handleDeleteQa(
                                    question.qaId,
                                    question.userEmail
                                  )
                                }
                                className="mt-2 text-red-500 hover:text-red-700"
                              >
                                Xoá
                              </button>
                            </div>
                          </div>
                          <button
                            // onClick={() => {
                            //   setSelectedQuestionId(question.qaId);
                            //   setShowReplyPopup(true);
                            // }}
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
          {!isPurchased ? (
            <div>
              {courses?.isPublic && (
                <div>
                  <h2 className="course-price">${courses?.price}</h2>

                  <button
                    className="btn add-to-cart"
                    onClick={() => handleAddToCart(courses?.courseId || "")}
                  >
                    {t("addToCart")}
                  </button>
                  <button
                    className="btn buy-course"
                    onClick={() => handleCheckOut()}
                  >
                    {t("buyCourse")}
                  </button>
                </div>
              )}
              {!courses?.isPublic && (
                <button
                  className="btn waitListCourse"
                  onClick={() => handleCreatWaitList()}
                >
                  {t("addToWaitList")}
                </button>
              )}
            </div>
          ) : (
            <button
              className="btn buy-course"
              onClick={() => handleGotoCourse()}
            >
              {t("GoToCourse")}
            </button>
          )}
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
