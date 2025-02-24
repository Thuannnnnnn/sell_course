"use client";
import { useEffect, useState } from "react";
import CourseInfoBanner from "@/components/Banner-CourseInfor";
import { BsFillCameraVideoFill } from "react-icons/bs";
import { IoDocumentText } from "react-icons/io5";
import { MdQuiz, MdOutlineSchool } from "react-icons/md";
import VideoLesson from "@/components/Lessons/Video";
import DocumentLesson from "@/components/Lessons/Doc";
import "../../style/CourseInfo.css";
import { AiOutlineDown } from "react-icons/ai";
import ExamPage from "../exam/Exam";
import { fetchLesson } from "@/app/api/course/LessonAPI";
import { useSession } from "next-auth/react";
import { CourseData } from "@/app/type/course/Lesson";
import { useParams } from "next/navigation";
import QuizPage from "../quizz/Quiz";

export default function CourseInfo() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState<number>(0);
  const [currentContentIndex, setCurrentContentIndex] = useState<number>(0);
  const [completedContents, setCompletedContents] = useState<string[]>([]);

  const { id } = useParams();
  const { data: session } = useSession();

  useEffect(() => {
    const loadLesson = async () => {
      if (!session?.user.token || !id) return;

      try {
        const lessonData = await fetchLesson(
          Array.isArray(id) ? id[0] : id,
          session.user.token
        );
        setCourseData(lessonData);
      } catch (error) {
        console.error("Failed to fetch lesson data:", error);
      }
    };

    loadLesson();
  }, [id, session]);

  const isContentCompleted = (contentId: string) =>
    completedContents.includes(contentId);

  const markContentCompleted = (contentId: string) => {
    if (!isContentCompleted(contentId)) {
      setCompletedContents([...completedContents, contentId]);
    }
  };

  const calculateProgress = () => {
    if (!courseData) return "0%";
    const totalContents = courseData.lessons.reduce(
      (total, lesson) => total + lesson.contents.length,
      0
    );
    const progress = (completedContents.length / totalContents) * 100;
    return `${progress.toFixed(0)}%`;
  };

  const handleNextContent = () => {
    if (!courseData) return;

    const currentLesson = courseData.lessons[currentLessonIndex];
    if (currentContentIndex + 1 < currentLesson.contents.length) {
      markContentCompleted(
        currentLesson.contents[currentContentIndex].contentId
      );
      setCurrentContentIndex(currentContentIndex + 1);
    } else if (currentLessonIndex + 1 < courseData.lessons.length) {
      markContentCompleted(
        currentLesson.contents[currentContentIndex].contentId
      );
      setCurrentLessonIndex(currentLessonIndex + 1);
      setCurrentContentIndex(0);
    }
  };

  const selectContent = (lessonIndex: number, contentIndex: number) => {
    setCurrentLessonIndex(lessonIndex);
    setCurrentContentIndex(contentIndex);
    markContentCompleted(
      courseData!.lessons[lessonIndex].contents[contentIndex].contentId
    );
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case "video":
        return <BsFillCameraVideoFill className="course-icon" />;
      case "document":
        return <IoDocumentText className="course-icon" />;
      case "quiz":
        return <MdQuiz className="course-icon" />;
      case "exam":
        return <MdOutlineSchool className="course-icon" />;
      default:
        return null;
    }
  };

  const renderLessonComponent = () => {
    if (!courseData) return <p>Loading...</p>;

    const currentLesson = courseData.lessons[currentLessonIndex];
    const currentContent = currentLesson.contents[currentContentIndex];

    if (!currentContent) return <p>Content not found</p>;

    const handleComplete = () => markContentCompleted(currentContent.contentId);

    switch (currentContent.contentType) {
      case "video":
        return (
          <VideoLesson
            title={currentContent.contentName}
            onComplete={handleComplete}
            duration={""}
          />
        );
      case "document":
        return (
          <DocumentLesson
            title={currentContent.contentName}
            onComplete={handleComplete}
            content={""}
          />
        );
      case "quiz":
        return <QuizPage />;
      case "exam":
        return <ExamPage />;
      default:
        return <p>Unknown content type</p>;
    }
  };

  return (
    <div className="course-info-container">
      <CourseInfoBanner title="Course" subtitle="Lesson Details" />
      <div className="course-header">
        <h1 className="course-title">{courseData?.courseName}</h1>
        <span className="course-progress">
          Your Progress: {calculateProgress()}
        </span>
      </div>
      <div className="course-nav">
        <div className="course-nav-content">
          <span className="nav-item active">📖 Overview</span>
        </div>
      </div>
      <div className="course-content-wrapper">
        <aside className="course-sidebar">
          <h2 className="course-title">Course Content</h2>
          <ul className="course-list1">
            {courseData &&
              courseData.lessons.map((section, sectionIndex) => (
                <li key={sectionIndex} className="course-section">
                  <div
                    className="course-section-header"
                    onClick={() =>
                      setExpanded(
                        expanded === sectionIndex ? null : sectionIndex
                      )
                    }
                  >
                    <span className="course-section-title">
                      {section.lessonName}
                    </span>
                    <AiOutlineDown
                      className={`dropdown-icon ${
                        expanded === sectionIndex ? "rotated" : ""
                      }`}
                    />
                  </div>
                  {expanded === sectionIndex && (
                    <ul className="course-lessons">
                      {section.contents.map((lesson, lessonIndex) => (
                        <li
                          key={lessonIndex}
                          className={`course-item ${
                            isContentCompleted(lesson.contentId)
                              ? "completed"
                              : ""
                          }`}
                          onClick={() =>
                            selectContent(sectionIndex, lessonIndex)
                          }
                        >
                          <div className="lesson-info">
                            {getLessonIcon(lesson.contentType)}
                            <span className="course-text">
                              {lesson.contentName}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
          </ul>
        </aside>
        <main className="course-video-section">
          {renderLessonComponent()}
          <div className="course-navigation">
            <button className="btn-next" onClick={handleNextContent}>
              Next →
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
