"use client";
import React, { useState, useEffect } from "react";
import { CourseSidebar } from "../../../components/course/CourseSidebar";
import { LessonContent } from "../../../components/course/LessonContent";
import { ExamComponent } from "../../../components/course/ExamComponent";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import { Button } from "../../../components/ui/button";
import { Progress } from "../../../components/ui/progress";
import { ArrowLeft, BookOpen, GraduationCap } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import { Label } from "../../../components/ui/label";
import { CheckCircle, AlertCircle } from "lucide-react";
import { CourseResponseDTO } from "../../types/Course/Course";
import { Content, Lesson } from "../../types/Course/Lesson/Lessons";
import courseApi from "../../api/courses/courses";
import { fetchLessonsByCourseId } from "../../api/courses/lessons/lessons";
import { fetchContentsByLesson } from "../../api/courses/lessons/content";
import { useSession } from "next-auth/react";

interface Exam {
  id: number;
  title: string;
  questions: number;
  duration: string;
  isLocked: boolean;
}

interface ExamQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
}

// Mock exam data (keeping as requested)
const MOCK_EXAMS: Exam[] = [
  {
    id: 1,
    title: "HTML & CSS Assessment",
    questions: 15,
    duration: "30 mins",
    isLocked: false,
  },
  {
    id: 2,
    title: "JavaScript Fundamentals Exam",
    questions: 20,
    duration: "45 mins",
    isLocked: true,
  },
  {
    id: 3,
    title: "Final Certification Exam",
    questions: 50,
    duration: "90 mins",
    isLocked: true,
  },
];

const MOCK_EXAM_QUESTIONS: ExamQuestion[] = [
  {
    id: 1,
    question: "What does HTML stand for?",
    options: [
      "HyperText Markup Language",
      "High Tech Modern Language",
      "Home Tool Markup Language",
      "Hyperlink and Text Markup Language",
    ],
    correctAnswer: "HyperText Markup Language",
  },
  {
    id: 2,
    question: "Which CSS property is used to change the text color?",
    options: ["font-size", "color", "background-color", "text-align"],
    correctAnswer: "color",
  },
  {
    id: 3,
    question: "How do you select an element with id='header' in CSS?",
    options: ["#header", ".header", "header", "*header"],
    correctAnswer: "#header",
  },
  {
    id: 4,
    question: "What is the correct way to declare a JavaScript variable?",
    options: ["var myVar;", "variable myVar;", "v myVar;", "declare myVar;"],
    correctAnswer: "var myVar;",
  },
  {
    id: 5,
    question: "Which HTML tag is used to create a hyperlink?",
    options: ["<link>", "<a>", "<href>", "<url>"],
    correctAnswer: "<a>",
  },
];

interface CourseLearnPageProps {
  params: { courseId: string };
  accessToken?: string;
}

export function CourseLearnPage({ params }: CourseLearnPageProps) {
  // State for API data
  const courseId = params.courseId;
  const { data: session } = useSession();
  const [course, setCourse] = useState<CourseResponseDTO | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Existing state
  const [activeTab, setActiveTab] = useState("content");
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentContent, setCurrentContent] = useState<Content | null>(null);

  // Exam state
  const [activeExamId, setActiveExamId] = useState<number | null>(null);
  const [examQuestionIdx, setExamQuestionIdx] = useState(0);
  const [examSelected, setExamSelected] = useState<string | null>(null);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examScore, setExamScore] = useState(0);
  const [examCompleted, setExamCompleted] = useState(false);
  const accessToken = session?.accessToken;
  // Load course data
  useEffect(() => {
    const loadCourseData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch course details
        const courseData = await courseApi.getCourseById(courseId);
        setCourse(courseData);

        // Fetch lessons for the course
        if (accessToken) {
          const lessonsWrapper = await fetchLessonsByCourseId(
            courseId,
            accessToken
          );
          const lessonsData = lessonsWrapper.lessons ?? [];

          // Fetch contents for each lesson
          const lessonsWithContents = await Promise.all(
            lessonsData.map(async (lesson) => {
              try {
                const contents = await fetchContentsByLesson(
                  lesson.lessonId,
                  accessToken
                );
                return { ...lesson, contents };
              } catch (contentError) {
                console.warn(
                  `Failed to load contents for lesson ${lesson.lessonId}:`,
                  contentError
                );
                return { ...lesson, contents: [] };
              }
            })
          );

          setLessons(lessonsWithContents);

          // Set initial lesson and content
          if (lessonsWithContents.length > 0) {
            const firstLesson = lessonsWithContents[0];
            setCurrentLesson(firstLesson);
            if (firstLesson.contents && firstLesson.contents.length > 0) {
              setCurrentContent(firstLesson.contents[0]);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load course data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load course data"
        );
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      loadCourseData();
    }
  }, [courseId, accessToken]);

  // Calculate progress
  const totalLessons = lessons.length;
  const completedLessons = Math.floor(totalLessons * 0.6); // 60% completed (mock calculation)
  const progress =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const handleLessonChange = async (lesson: Lesson) => {
    setCurrentLesson(lesson);

    // If the lesson doesn't have contents loaded, try to load them
    if (!lesson.contents || lesson.contents.length === 0) {
      if (accessToken) {
        try {
          const contents = await fetchContentsByLesson(
            lesson.lessonId,
            accessToken
          );
          const updatedLesson = { ...lesson, contents };
          setCurrentLesson(updatedLesson);

          // Update the lessons state
          setLessons((prevLessons) =>
            prevLessons.map((l) =>
              l.lessonId === lesson.lessonId ? updatedLesson : l
            )
          );

          if (contents.length > 0) {
            setCurrentContent(contents[0]);
          }
        } catch (error) {
          console.error("Failed to load lesson contents:", error);
        }
      }
    } else {
      setCurrentContent(lesson.contents[0] || null);
    }

    setActiveTab("content");
  };

  const handleContentChange = (content: Content) => {
    setCurrentContent(content);
  };

  // Exam logic (unchanged)
  const handleStartExam = (examId: number) => {
    setActiveExamId(examId);
    setExamQuestionIdx(0);
    setExamSelected(null);
    setExamSubmitted(false);
    setExamScore(0);
    setExamCompleted(false);
  };

  const handleExamSubmit = () => {
    if (!examSelected) return;
    setExamSubmitted(true);
    if (examSelected === MOCK_EXAM_QUESTIONS[examQuestionIdx].correctAnswer) {
      setExamScore((prev) => prev + 1);
    }
  };

  const handleExamNext = () => {
    if (examQuestionIdx < MOCK_EXAM_QUESTIONS.length - 1) {
      setExamQuestionIdx((idx) => idx + 1);
      setExamSelected(null);
      setExamSubmitted(false);
    } else {
      setExamCompleted(true);
    }
  };

  const handleExamRetry = () => {
    setExamQuestionIdx(0);
    setExamSelected(null);
    setExamSubmitted(false);
    setExamScore(0);
    setExamCompleted(false);
    setActiveExamId(null);
  };

  const getContentDuration = (content: Content) => {
    console.log(content)
    switch (content.contentType) {
      case "video":
        return "12:30";
      case "text":
        return "15 mins read";
      case "quiz":
        return "10 questions";
      default:
        return "5 mins";
    }
  };

  const isContentCompleted = (content: Content) => {
    // Mock completion logic - you can implement real completion tracking
    return parseInt(content.contentId.split("-")[1]) <= 3;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading course...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Course</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  // No course found
  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Course Not Found</h2>
          <p className="text-muted-foreground">
            The requested course could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 items-center justify-between">
          <div className="flex items-center gap-4 pl-4">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">{course.title}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Instructor: {course.instructorName}</span>
                <span>•</span>
                <span>{course.level} Level</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6 pr-6">
            <div className="flex flex-col gap-1 w-48">
              <div className="flex justify-between text-sm">
                <span>Course Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            <Button>Continue Learning</Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="sticky top-16 h-[calc(100vh-4rem)] z-30">
          <CourseSidebar
            lessons={lessons}
            currentLesson={currentLesson}
            currentContent={currentContent}
            onLessonSelect={handleLessonChange}
            onContentSelect={handleContentChange}
            getContentDuration={getContentDuration}
            isContentCompleted={isContentCompleted}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container py-6 px-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="mb-6">
                <TabsTrigger
                  value="content"
                  className="flex items-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Lesson Content
                </TabsTrigger>
                <TabsTrigger value="exams" className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Exams & Assessments
                </TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="mt-0">
                <div className="">
                  {currentContent && currentLesson && (
                    <LessonContent
                      Lesson={currentLesson}
                      content={currentContent}
                      getContentDuration={getContentDuration}
                    />
                  )}
                  {!currentContent && lessons.length > 0 && (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Select a lesson to start learning
                      </p>
                    </div>
                  )}
                  {lessons.length === 0 && (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        No lessons available for this course
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="exams" className="mt-0">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeExamId === null ? (
                    MOCK_EXAMS.map((exam) => (
                      <div
                        key={exam.id}
                        className="bg-white dark:bg-card rounded-xl shadow-lg p-6 flex flex-col gap-4"
                      >
                        <ExamComponent exam={exam} />
                        <Button
                          className="mt-2"
                          onClick={() => handleStartExam(exam.id)}
                          disabled={exam.isLocked}
                        >
                          {exam.isLocked ? "Locked" : "Start Exam"}
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full">
                      {/* Exam in-progress UI */}
                      {!examCompleted ? (
                        <div className="max-w-2xl mx-auto bg-white dark:bg-card rounded-xl shadow-lg p-8">
                          <div className="flex justify-between items-center mb-6">
                            <div className="text-sm font-medium text-muted-foreground">
                              Question {examQuestionIdx + 1} of{" "}
                              {MOCK_EXAM_QUESTIONS.length}
                            </div>
                            <div className="text-sm font-medium">
                              Score: {examScore}/
                              {examQuestionIdx + (examSubmitted ? 1 : 0)}
                            </div>
                          </div>
                          <Progress
                            value={
                              ((examQuestionIdx + 1) /
                                MOCK_EXAM_QUESTIONS.length) *
                              100
                            }
                            className="mb-8"
                          />

                          <div className="mb-8">
                            <h3 className="text-xl font-semibold mb-6">
                              {MOCK_EXAM_QUESTIONS[examQuestionIdx].question}
                            </h3>

                            <RadioGroup
                              value={examSelected || ""}
                              onValueChange={setExamSelected}
                              disabled={examSubmitted}
                              className="space-y-3"
                            >
                              {MOCK_EXAM_QUESTIONS[examQuestionIdx].options.map(
                                (option, idx) => (
                                  <div
                                    key={idx}
                                    className={`flex items-center space-x-3 border p-4 rounded-lg transition-colors ${
                                      examSubmitted
                                        ? option ===
                                          MOCK_EXAM_QUESTIONS[examQuestionIdx]
                                            .correctAnswer
                                          ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                                          : examSelected === option
                                          ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                                          : "border-border"
                                        : "hover:bg-accent border-border"
                                    }`}
                                  >
                                    <RadioGroupItem
                                      value={option}
                                      id={`exam-option-${idx}`}
                                      className="mt-0"
                                    />
                                    <Label
                                      htmlFor={`exam-option-${idx}`}
                                      className="flex-1 cursor-pointer text-sm leading-relaxed"
                                    >
                                      {option}
                                    </Label>
                                    {examSubmitted &&
                                      option ===
                                        MOCK_EXAM_QUESTIONS[examQuestionIdx]
                                          .correctAnswer && (
                                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                                      )}
                                    {examSubmitted &&
                                      examSelected === option &&
                                      option !==
                                        MOCK_EXAM_QUESTIONS[examQuestionIdx]
                                          .correctAnswer && (
                                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                                      )}
                                  </div>
                                )
                              )}
                            </RadioGroup>
                          </div>

                          <div className="flex justify-between items-center">
                            <Button variant="outline" onClick={handleExamRetry}>
                              Cancel Exam
                            </Button>
                            {examSubmitted ? (
                              <Button onClick={handleExamNext}>
                                {examQuestionIdx <
                                MOCK_EXAM_QUESTIONS.length - 1
                                  ? "Next Question"
                                  : "Finish Exam"}
                              </Button>
                            ) : (
                              <Button
                                onClick={handleExamSubmit}
                                disabled={!examSelected}
                              >
                                Submit Answer
                              </Button>
                            )}
                          </div>

                          {examSubmitted && (
                            <div className="mt-4 p-4 rounded-lg bg-muted">
                              <div
                                className={`text-sm font-medium ${
                                  examSelected ===
                                  MOCK_EXAM_QUESTIONS[examQuestionIdx]
                                    .correctAnswer
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {examSelected ===
                                MOCK_EXAM_QUESTIONS[examQuestionIdx]
                                  .correctAnswer
                                  ? "✓ Correct! Well done."
                                  : `✗ Incorrect. The correct answer is: ${MOCK_EXAM_QUESTIONS[examQuestionIdx].correctAnswer}`}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="max-w-md mx-auto bg-white dark:bg-card rounded-xl shadow-lg p-8 text-center">
                          <div className="text-3xl font-bold mb-6">
                            Exam Completed!
                          </div>
                          <div className="flex justify-center mb-8">
                            <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-4xl font-bold text-primary">
                                {Math.round(
                                  (examScore / MOCK_EXAM_QUESTIONS.length) * 100
                                )}
                                %
                              </span>
                            </div>
                          </div>
                          <div className="text-xl mb-4">
                            You scored {examScore} out of{" "}
                            {MOCK_EXAM_QUESTIONS.length}
                          </div>
                          {examScore === MOCK_EXAM_QUESTIONS.length ? (
                            <div className="flex items-center justify-center gap-2 text-green-600 mb-6">
                              <CheckCircle className="h-5 w-5" />
                              <span className="font-medium">
                                Perfect score! Excellent work!
                              </span>
                            </div>
                          ) : examScore >= MOCK_EXAM_QUESTIONS.length * 0.7 ? (
                            <div className="text-muted-foreground mb-6">
                              Great job! You passed the exam.
                            </div>
                          ) : (
                            <div className="text-muted-foreground mb-6">
                              Review the material and try again to improve your
                              score.
                            </div>
                          )}
                          <div className="flex gap-3 justify-center">
                            <Button variant="outline" onClick={handleExamRetry}>
                              Back to Exams
                            </Button>
                            <Button onClick={handleExamRetry}>
                              Retry Exam
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}

export default CourseLearnPage;
