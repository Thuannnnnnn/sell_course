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

    const handleComplete = () =>
      markContentCompleted(currentContent.contentId, currentLesson.lessonId);
    switch (currentContent.contentType) {
      case "video":
        return (
          <VideoLesson
            title={currentContent.contentName}
            contentId={currentContent.contentId}
            lessonId={currentLesson.lessonId}
            onComplete={handleComplete}
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
        return <QuizPage contentId={currentContent.contentId} />;
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
          </ul>
        </aside>
        <main className="course-video-section">
          {renderLessonComponent()}
          {/* <div className="course-navigation">
            <button className="btn-next" onClick={handleNextContent}>
              Next →
            </button>
          </div> */}
        </main>
      </div>
    </div>
  );
}
