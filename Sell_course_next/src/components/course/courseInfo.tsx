"use client";
import { useEffect, useState } from "react";
import CourseInfoBanner from "@/components/Banner-CourseInfor";
import { BsFillCameraVideoFill } from "react-icons/bs";
import { IoDocumentText } from "react-icons/io5";
import { MdOutlineSchool, MdQuiz } from "react-icons/md";
import VideoLesson from "@/components/Lessons/Video";
import DocumentLesson from "@/components/Lessons/Doc";
import "../../style/CourseInfo.css";
import { FaLock, FaLockOpen } from "react-icons/fa";
import { AiOutlineDown } from "react-icons/ai";
import ExamPage from "../exam/Exam";
import { fetchLesson } from "@/app/api/course/LessonAPI";
import { useSession } from "next-auth/react";
import { CourseData } from "@/app/type/course/Lesson";
import { useParams } from "next/navigation";
import QuizPage from "../quizz/Quiz";
import {getExamByCourseId} from "@/app/api/exam/exam";
import {
  fetchContentStatus,
  fetchCourseProgress,
  markContentAsCompleted,
} from "@/app/api/progress/ProgressAPI";

export default function CourseInfo() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState<number>(0);
  const [currentContentIndex, setCurrentContentIndex] = useState<number>(0);
  const [completedContents, setCompletedContents] = useState<string[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [examData, setExamData] = useState(null); 
  const { id } = useParams();
  const { data: session } = useSession();
  const [examExists, setExamExists] = useState<boolean>(false);

  useEffect(() => {
    const loadLesson = async () => {
      if (!session?.user.token || !id) return;

      try {
        const lessonData = await fetchLesson(
          Array.isArray(id) ? id[0] : id,
          session.user.token
        );
        if (!lessonData || !lessonData.lessons) return;
        setCourseData(lessonData);

        const completedList: string[] = [];

        for (const lesson of lessonData.lessons) {
          for (const content of lesson.contents) {
            try {
              const isContentCompleted = await fetchContentStatus(
                content.contentId,
                session.user.user_id,
                session.user.token
              );

              if (isContentCompleted) {
                completedList.push(content.contentId);
              }
            } catch (error) {
              console.error(
                `Error fetching content status for ${content.contentId}:`,
                error
              );
            }
          }
        }

        setCompletedContents(completedList);
      } catch (error) {
        console.error("Failed to fetch lesson data:", error);
      }
    };
    const loadProgress = async () => {
      if (!session?.user.token || !id) return;

      try {
        const response = await fetchCourseProgress(
          Array.isArray(id) ? id[0] : id,
          session.user.user_id,
          session.user.token
        );
        setProgress(response);
      } catch (error) {
        console.error("Failed to fetch progress:", error);
      }
    };
    const checkExam = async () => {
      if (!session?.user.token || !id) return;
      try {
        const examData = await getExamByCourseId(
          Array.isArray(id) ? id[0] : id,
          session.user.token
        );
        setExamExists(!!examData); // Nếu có exam thì true, không có thì false
      } catch (error) {
        console.error("Failed to fetch exam data:", error);
      }
    };
    checkExam();
    loadProgress();
    loadLesson();
  }, [id, session]);
  const isContentCompleted = (contentId: string) =>
    completedContents.includes(contentId);

  const markContentCompleted = async (contentId: string, lessonId: string) => {
    if (!isContentCompleted(contentId) && session?.user.token && id) {
      try {
        await markContentAsCompleted(
          session.user.user_id,
          contentId,
          lessonId,
          session.user.token
        );

        setCompletedContents([...completedContents, contentId]);

        const updatedProgress = await fetchCourseProgress(
          Array.isArray(id) ? id[0] : id,
          session.user.user_id,
          session.user.token
        );
        setProgress(updatedProgress);
      } catch (error) {
        console.error("Failed to mark content as completed:", error);
      }
    }
  };

  const handleNextContent = () => {
    if (!courseData) return;

    const currentLesson = courseData.lessons[currentLessonIndex];
    if (currentContentIndex + 1 < currentLesson.contents.length) {
      setCurrentContentIndex(currentContentIndex + 1);
    } else if (currentLessonIndex + 1 < courseData.lessons.length) {
      setCurrentLessonIndex(currentLessonIndex + 1);
      setCurrentContentIndex(0);
    }
  };

  const selectContent = (lessonIndex: number, contentIndex: number) => {
    setCurrentLessonIndex(lessonIndex);
    setCurrentContentIndex(contentIndex);
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case "video":
        return <BsFillCameraVideoFill className="course-icon" />;
      case "document":
        return <IoDocumentText className="course-icon" />;
      case "quiz":
        return <MdQuiz className="course-icon" />;
      default:
        return null;
    }
  };

  const renderLessonComponent = () => {
    if (!courseData) return <p>Loading...</p>;
    const currentLesson = courseData.lessons[currentLessonIndex];
    const currentContent = currentLesson.contents[currentContentIndex];

    if (!currentContent) return <p>Content not found</p>;

    const handleComplete = () =>
      markContentCompleted(currentContent.contentId, currentLesson.lessonId);
    switch (currentContent.contentType) {
      case "video":
        return (
          <VideoLesson
            title={currentContent.contentName}
            onComplete={handleComplete}
            lessonId={currentLesson.lessonId}
            contentId={currentContent.contentId}
          />
        );
      case "document":
        return (
          <DocumentLesson
            title={currentContent.contentName}
            onComplete={handleComplete}
            lessonId={currentLesson.lessonId}
            contentId={currentContent.contentId}
            onNextContent={handleNextContent}
          />
        );
      case "quiz":
        return (
          <QuizPage
            onComplete={handleComplete}
            lessonId={currentLesson.lessonId}
            contentId={currentContent.contentId}
          />
        );
      default:
        return <p>Unknown content type</p>;
    }
  };

  return (
    <div className="course-info-container">
      <CourseInfoBanner title="Course" subtitle="Lesson Details" />
      <div className="course-header">
        <h1 className="course-title">{courseData?.courseName}</h1>
        <span className="course-progress">Your Progress: {progress} %</span>
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
                      setExpanded(expanded === sectionIndex ? null : sectionIndex)
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
                            isContentCompleted(lesson.contentId) ? "completed" : ""
                          }`}
                          onClick={() => selectContent(sectionIndex, lessonIndex)}
                        >
                          <div className="lesson-info">
                            {getLessonIcon(lesson.contentType)}
                            <span className="course-text">
                              {lesson.contentName}
                            </span>
                            {isContentCompleted(lesson.contentId) && (
                              <span className="completed-icon">✅</span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            {/* Exam Section */}
            <li className="course-section">
              <div className="course-section-header">
                <span className="course-section-title">Exam</span>
              </div>
              <ul className="course-lessons">
                <li
                  className="course-item"
                  onClick={() => {
                    if (examExists) {
                      setCurrentLessonIndex(-1);
                      setCurrentContentIndex(-1);
                    }
                  }}
                >
                  <div className="lesson-info">
                    <MdOutlineSchool className="course-icon" />
                    <span className="course-text">Final Exam</span>
                    {examExists ? (
                      <FaLockOpen className="completed-icon" style={{ color: "green" }} />
                    ) : (
                      <FaLock className="completed-icon" style={{ color: "gray" }} />
                    )}
                  </div>
                </li>
              </ul>
            </li>
          </ul>
        </aside>
        <main className="course-video-section">
          {renderLessonComponent()}
          {currentLessonIndex === -1 && examExists && (
            <div className="exam-section">
              <h2 className="exam-title">Exam</h2>
              <ExamPage />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
