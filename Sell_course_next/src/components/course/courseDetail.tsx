import { useEffect, useState } from "react";
import "@/style/CourseDetail.css";
import { fetchCourseById } from "@/app/api/course/CourseAPI";
import { Course } from "@/app/type/course/Course";
import { format } from "date-fns";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
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
  const token = "your_auth_token_here";

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await fetchCourseById(courseId, token);
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
    if (dateString) return format(new Date(dateString), "MMMM d, yyyy");
  };
  return (
    <div className="container">
      <div className="button-wrapper">
        <button onClick={handleClick}>
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
            <p>Teacher</p>
            <h3>{courses?.userName}</h3>
          </div>
          <div>
            <p>Category</p>
            <h3>{courses?.categoryName}</h3>
          </div>
          <div>
            <p>Last Update</p>
            <h3>{formatDate(courses?.updatedAt || "")}</h3>
          </div>
          <div>
            <p>⭐⭐⭐⭐⭐</p>
            <h3>Rating:5/5</h3>
          </div>
        </div>
      </div>

      <div className="content-detailCourse">
        <div className="content-left">
          <div className="course-description">
            <h2>About Course</h2>
            <div
              className={`ql-editor ${isExpanded ? "expanded" : "collapsed"}`}
              dangerouslySetInnerHTML={{ __html: courses?.description ?? "" }}
            />
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="read-more-btn"
            >
              {isExpanded ? "Thu gọn" : "Đọc thêm"}
            </button>
          </div>

          <div className="course-curriculum">
            <h2>Course Curriculum</h2>

            <div className="curriculum-section">
              <h3
                onClick={() => toggleSection("intro")}
                className="section-title"
              >
                Intro to course {expandedSections.intro ? "▼" : "▶"}
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
                Exam {expandedSections.exam ? "▼" : "▶"}
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
            width="100%"
            height="150"
            src={courses?.videoInfo}
            allowFullScreen
          ></iframe>

          <h2 className="course-price">${courses?.price}</h2>

          <button className="btn add-to-cart">Add to cart</button>
          <button className="btn buy-course">Buy course</button>

          <div className="course-details">
            <div className="row"></div>
            <div className="row"></div>
            <div className="row"></div>
            <div className="row"></div>
            <div className="row"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
