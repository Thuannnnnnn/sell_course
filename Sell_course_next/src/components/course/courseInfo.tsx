"use client";
import { useState } from "react";
import CourseInfoBanner from "@/components/Banner-CourseInfor";
import { BsFillCameraVideoFill } from "react-icons/bs";
import { IoDocumentText, IoCheckmarkDoneCircle } from "react-icons/io5";
import { MdQuiz, MdOutlineSchool } from "react-icons/md";
import VideoLesson from "@/components/Lessons/Video";
import DocumentLesson from "@/components/Lessons/Doc";
import QuizLesson from "@/components/Lessons/Quiz";
import "../../style/CourseInfo.css";
import { AiOutlineDown } from "react-icons/ai";
import ExamPage from "../exam/Exam";
export default function CourseInfo() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [currentLesson, setCurrentLesson] = useState<number>(0);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);

  const courseSections = [
    {
      title: "Intro to Course and History",
      completed: 0,
      total: 4,
      lessons: [
        {
          type: "video",
          title: "Video: Course Info",
          duration: "5:36",
          completed: false,
        },
        {
          type: "document",
          title: "Document: Course Guidelines",
          content: "Welcome to the course!",
          completed: false,
        },
        {
          type: "quiz",
          title: "Quiz: Introduction",
          questions: [
            {
              question: "What is this course about?",
              options: ["Design", "Cooking", "Finance"],
              correct: 0,
            },
          ],
          completed: false,
        },
        {
          type: "exam",
          title: "Exam: Final Test",
          questions: [
            {
              question: "What is interior design?",
              options: ["Art", "Science", "Both"],
              correct: 2,
            },
          ],
          completed: false,
        },
      ],
    },
  ];

  const isLessonCompleted = (lessonIndex: number) =>
    completedLessons.includes(lessonIndex);

  const markLessonCompleted = (lessonIndex: number) => {
    if (!isLessonCompleted(lessonIndex)) {
      setCompletedLessons([...completedLessons, lessonIndex]);
    }
  };

  const calculateProgress = () => {
    const totalLessons = courseSections[0].lessons.length;
    const progress = (completedLessons.length / totalLessons) * 100;
    return `${progress.toFixed(0)}%`;
  };

  const handleNextLesson = () => {
    const totalLessons = courseSections[0].lessons.length;
    if (currentLesson + 1 < totalLessons) {
      markLessonCompleted(currentLesson);
      setCurrentLesson(currentLesson + 1);
    }
  };

  const selectLesson = (index: number) => {
    setCurrentLesson(index);
    markLessonCompleted(index);
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
    const currentLessonData = courseSections[0]?.lessons[currentLesson];

    if (!currentLessonData) return <p>Lesson not found</p>;

    const handleComplete = () => {
      markLessonCompleted(currentLesson);
    };

    switch (currentLessonData.type) {
      case "video":
        return (
          <VideoLesson
            title={currentLessonData.title || "Untitled Video"}
            duration={currentLessonData.duration || "0:00"}
            onComplete={handleComplete}
          />
        );
      case "document":
        return (
          <DocumentLesson
            title={currentLessonData.title || "Untitled Document"}
            fileUrl="https://sdnmma.blob.core.windows.net/wdp/6445e536-f667-46df-b432-4e341e4a51ca-productsDetai%20compare%20search.docx"
            onComplete={handleComplete}
          />
        );
      case "quiz":
        return (
          <QuizLesson
            title={currentLessonData.title || "Untitled Quiz"}
            questions={currentLessonData.questions || []}
            onComplete={handleComplete}
          />
        );
      case "exam":
        return <ExamPage />;
      default:
        return <p>Lesson type not found</p>;
    }
  };

  return (
    <div className="course-info-container">
      <CourseInfoBanner title="Course" subtitle="Lesson Details" />
      <div className="course-header">
        <h1 className="course-title">Interior design concepts Masterclass</h1>
        <span className="course-progress">
          Your Progress: {calculateProgress()}
        </span>
      </div>
      <div className="course-nav">
        <div className="course-nav-content">
          <span className="nav-item active">📖 Overview</span>
          {/* <span className="nav-item">💬 Q&A</span> */}
        </div>
      </div>
      <div className="course-content-wrapper">
        <aside className="course-sidebar">
          <h2 className="course-title">Course Content</h2>
          <ul className="course-list">
            {courseSections.map((section, sectionIndex) => (
              <li key={sectionIndex} className="course-section">
                <div
                  className="course-section-header"
                  onClick={() =>
                    setExpanded(expanded === sectionIndex ? null : sectionIndex)
                  }
                >
                  <span className="course-section-title">{section.title}</span>
                  <span className="course-section-progress">
                    {completedLessons.length}/{section.total}
                  </span>
                  <AiOutlineDown
                    className={`dropdown-icon ${
                      expanded === sectionIndex ? "rotated" : ""
                    }`}
                  />
                </div>
                {expanded === sectionIndex && (
                  <ul className="course-lessons">
                    {section.lessons.map((lesson, lessonIndex) => (
                      <li
                        key={lessonIndex}
                        className={`course-item ${
                          currentLesson === lessonIndex ? "active" : ""
                        }`}
                        onClick={() => selectLesson(lessonIndex)}
                      >
                        <div className="lesson-info">
                          {getLessonIcon(lesson.type)}
                          <span className="course-text">{lesson.title}</span>
                        </div>
                        <div className="lesson-meta">
                          {lesson.duration && (
                            <span className="course-duration">
                              {lesson.duration}
                            </span>
                          )}
                          {isLessonCompleted(lessonIndex) && (
                            <IoCheckmarkDoneCircle className="course-check" />
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
          <div className="course-navigation">
            <button
              className="btn-prev"
              disabled={currentLesson === 0}
              onClick={() => setCurrentLesson(currentLesson - 1)}
            >
              ← Previous
            </button>
            <button className="btn-next" onClick={handleNextLesson}>
              Next →
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
