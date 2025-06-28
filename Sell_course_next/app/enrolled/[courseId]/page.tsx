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
import { ArrowLeft, BookOpen, GraduationCap, Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import { Label } from "../../../components/ui/label";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useParams } from "next/navigation";
import {
  courseApi,
  contentApi,
  examApi,
} from "../../api/courses/lessons/lessons";
import {
  CourseData,
  LessonWithContent,
  ContentResponse,
  LessonResponse,
  CourseResponse,
  DocumentResponse,
  QuizResponse,
  ExamQuestion,
} from "../../types/Course/Lesson/Lessons";
import { VideoState } from "@/app/types/Course/Lesson/content/video";

export function CourseLearnPage() {
  const params = useParams();
  const courseId = params.courseId as string;

  const [activeTab, setActiveTab] = useState("content");
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [currentLesson, setCurrentLesson] = useState<LessonResponse | null>(
    null
  );
  const [currentContent, setCurrentContent] =
    useState<LessonWithContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Exam state
  const [activeExamId, setActiveExamId] = useState<number | null>(null);
  const [examQuestionIdx, setExamQuestionIdx] = useState(0);
  const [examSelected, setExamSelected] = useState<string | null>(null);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examScore, setExamScore] = useState(0);
  const [examCompleted, setExamCompleted] = useState(false);
  const [examQuestions, setExamQuestions] = useState<ExamQuestion[]>([]);

  const [selectedContent, setSelectedContent] =
    useState<ContentResponse | null>(null);
  const [completedContents, setCompletedContents] = useState<Set<string>>(
    new Set()
  );
  const [lessons, setLessons] = useState<LessonResponse[]>([]);

  // Helper functions for sidebar
  const getContentDuration = (content: ContentResponse): string => {
    switch (content.contentType.toLowerCase()) {
      case "video":
        return "10:25";
      case "doc":
        return "5 mins read";
      case "quiz":
        return "10 questions";
      default:
        return "5 mins";
    }
  };

  const isContentCompleted = (content: ContentResponse): boolean => {
    return completedContents.has(content.contentId);
  };

  // Fetch course data from API
  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch course details
        const course = (await courseApi.getCourseById(
          courseId
        )) as CourseResponse;

        // Fetch lessons for this course
        const lessonsResponse = (await courseApi.getLessonsByCourseId(
          courseId
        )) as { lessons: LessonResponse[] };

        // Extract lessons from the response
        const lessons = lessonsResponse.lessons || [];
        setLessons(lessons);

        // Process each lesson to get its contents
        const lessonsWithContent = await Promise.all(
          lessons.map(async (lesson: LessonResponse) => {
            try {
              // Use contents from the API response
              const contents = lesson.contents || [];

              // Determine lesson type and content based on first content
              let lessonType: "video" | "text" | "quiz" = "text";
              let lessonContent:
                | VideoState
                | DocumentResponse
                | QuizResponse
                | { text: string } = { text: "No content available" };
              let duration = "5 mins read";

              if (contents && contents.length > 0) {
                const firstContent = contents[0];

                try {
                  switch (firstContent.contentType.toLowerCase()) {
                    case "video":
                      lessonType = "video";
                      const videoContent = (await contentApi.getVideoContent(
                        firstContent.contentId
                      )) as VideoState;
                      lessonContent = videoContent;
                      duration = "10:25";
                      break;
                    case "doc":
                      lessonType = "text";
                      const docContent = (await contentApi.getDocumentContent(
                        firstContent.contentId
                      )) as DocumentResponse;
                      lessonContent = { text: docContent.url } as {
                        text: string;
                      };
                      duration = "5 mins read";
                      break;
                    case "quiz":
                      lessonType = "quiz";
                      const quizContent =
                        (await contentApi.getQuizContent()) as QuizResponse;
                      lessonContent = quizContent;
                      duration = `${
                        quizContent.questions?.length || 0
                      } questions`;
                      break;

                    default:
                      lessonType = "text";
                      lessonContent = { text: "Content not available" };
                      duration = "5 mins read";
                  }
                } catch {
                  lessonType = "text";
                  lessonContent = { text: "Content not available" };
                  duration = "5 mins read";
                }

                const transformedLesson: LessonWithContent = {
                  id: lesson.lessonId,
                  title: lesson.lessonName,
                  type: lessonType,
                  duration,
                  isCompleted: false,
                  content: lessonContent,
                  contents: contents.map((content) => ({
                    ...content,
                    isCompleted: completedContents.has(content.contentId),
                  })),
                };
                return transformedLesson;
              } else {
                // No contents available
                return {
                  id: lesson.lessonId,
                  title: lesson.lessonName,
                  type: "text" as const,
                  duration: "5 mins read",
                  isCompleted: false,
                  content: { text: "No content available" },
                  contents: [],
                };
              }
            } catch {
              return {
                id: lesson.lessonId,
                title: lesson.lessonName,
                type: "text" as const,
                duration: "5 mins read",
                isCompleted: false,
                content: { text: "Error loading content" },
                contents: [],
              };
            }
          })
        );

        // Group lessons into modules (for now, just one module)
        const courseData: CourseData = {
          id: course.courseId,
          title: course.title,
          instructor: course.instructorName || "Unknown Instructor",
          progress: 35, // This should come from enrollment progress
          modules: [
            {
              id: "1",
              title: "Course Content",
              lessons: lessonsWithContent,
            },
          ],
          exams: [
            {
              id: 1,
              title: "Mid-course Assessment",
              questions: 25,
              duration: "45 mins",
              isLocked: false,
            },
            {
              id: 2,
              title: "Final Certification Exam",
              questions: 50,
              duration: "90 mins",
              isLocked: true,
            },
          ],
        };

        setCourseData(courseData);

        // Set initial lesson and content
        if (lessons.length > 0) {
          setCurrentLesson(lessons[0]);
          if (lessonsWithContent.length > 0) {
            setCurrentContent(lessonsWithContent[0]);
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load course data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, completedContents]);

  const handleLessonSelect = (lesson: LessonResponse) => {
    setCurrentLesson(lesson);
    setActiveTab("content");

    // Find the corresponding LessonWithContent from our data
    const lessonWithContent = courseData?.modules[0].lessons.find(
      (l) => l.id === lesson.lessonId
    );
    if (lessonWithContent) {
      setCurrentContent(lessonWithContent);
    }
  };

  const handleContentSelect = async (content: ContentResponse) => {
    setSelectedContent(content);

    // Find the lesson containing this content
    const lesson = lessons.find((l: LessonResponse) =>
      l.contents.some((c) => c.contentId === content.contentId)
    );
    if (lesson) {
      setCurrentLesson(lesson);
    }

    // Find the corresponding LessonWithContent
    const lessonWithContent = courseData?.modules[0].lessons.find(
      (l: LessonWithContent) =>
        l.contents.some((c) => c.contentId === content.contentId)
    );
    if (lessonWithContent) {
      setCurrentContent(lessonWithContent);
    }
  };

  // Exam logic with API calls
  const handleStartExam = async (examId: number) => {
    setActiveExamId(examId);
    setExamQuestionIdx(0);
    setExamSelected(null);
    setExamSubmitted(false);
    setExamScore(0);
    setExamCompleted(false);

    try {
      // Fetch exam questions from API
      const questions = (await examApi.getExamQuestions(
        examId
      )) as ExamQuestion[];
      setExamQuestions(questions);
    } catch {
      setError("Failed to load exam questions");
    }
  };

  const handleExamSubmit = async () => {
    if (!examSelected || !activeExamId) return;

    setExamSubmitted(true);

    try {
      // Submit answer to API
      const result = (await examApi.submitExamAnswer(
        activeExamId,
        examQuestions[examQuestionIdx].id,
        examSelected
      )) as { correct: boolean };

      if (result.correct) {
        setExamScore((prev) => prev + 1);
      }
    } catch {
      // Fallback to local checking if API fails
      if (examSelected === examQuestions[examQuestionIdx].correctAnswer) {
        setExamScore((prev) => prev + 1);
      }
    }
  };

  const handleExamNext = () => {
    if (examQuestionIdx < examQuestions.length - 1) {
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
    setExamQuestions([]);
  };

  // Handle content completion
  const handleContentComplete = (contentId: string) => {
    setCompletedContents((prev) => new Set([...Array.from(prev), contentId]));

    // Update lesson completion status if all contents are completed
    if (currentLesson) {
      const allContents = currentLesson.contents || [];
      const completedCount = completedContents.size + 1; // +1 for current content

      if (completedCount >= allContents.length) {
        // Mark lesson as completed
        setCourseData((prev) => {
          if (!prev) return prev;

          return {
            ...prev,
            modules: prev.modules.map((module) => ({
              ...module,
              lessons: module.lessons.map((lesson) =>
                lesson.id === currentLesson.lessonId
                  ? { ...lesson, isCompleted: true }
                  : lesson
              ),
            })),
          };
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading course data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Course Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The course you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have access to it.
          </p>
          <Button asChild>
            <a href="/courses">Browse Courses</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 items-center justify-between">
          <div className="flex items-center gap-4 pl-0">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">{courseData.title}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Instructor: {courseData.instructor}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6 pr-5">
            <div className="flex flex-col gap-1 w-48">
              <div className="flex justify-between text-sm">
                <span>Course Progress</span>
                <span>{courseData.progress}%</span>
              </div>
              <Progress value={courseData.progress} className="h-2" />
            </div>
            <Button>Continue Learning</Button>
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="sticky top-20 h-[calc(100vh-5rem)] z-30">
          <CourseSidebar
            lessons={lessons}
            currentLesson={currentLesson}
            currentContent={currentContent}
            onLessonSelect={handleLessonSelect}
            onContentSelect={handleContentSelect}
            getContentDuration={getContentDuration}
            isContentCompleted={isContentCompleted}
          />
        </aside>
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container py-10 ml-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="mb-4">
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
                {currentContent && (
                  <LessonContent
                    lesson={currentContent}
                    content={selectedContent}
                    onContentComplete={handleContentComplete}
                  />
                )}
              </TabsContent>
              <TabsContent value="exams" className="mt-0">
                <div className="grid md:grid-cols-2 gap-6">
                  {activeExamId === null ? (
                    courseData.exams.map((exam) => (
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
                          Start Exam
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2">
                      {/* Exam in-progress UI */}
                      {!examCompleted ? (
                        <div className="max-w-xl mx-auto bg-white dark:bg-card rounded-xl shadow-lg p-8">
                          <div className="flex justify-between items-center mb-4">
                            <div className="text-sm font-medium">
                              Question {examQuestionIdx + 1} of{" "}
                              {examQuestions.length}
                            </div>
                            <div className="text-sm font-medium">
                              Score: {examScore}/{examQuestionIdx}
                            </div>
                          </div>
                          <Progress
                            value={
                              ((examQuestionIdx + 1) / examQuestions.length) *
                              100
                            }
                            className="mb-8"
                          />
                          <div className="mb-6 text-lg font-semibold">
                            {examQuestions[examQuestionIdx].question}
                          </div>
                          <RadioGroup
                            value={examSelected || ""}
                            onValueChange={setExamSelected}
                            disabled={examSubmitted}
                          >
                            {examQuestions[examQuestionIdx].options.map(
                              (option: string, idx: number) => (
                                <div
                                  key={idx}
                                  className={`flex items-center space-x-2 border p-4 rounded-md mb-2 ${
                                    examSubmitted
                                      ? option ===
                                        examQuestions[examQuestionIdx]
                                          .correctAnswer
                                        ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                                        : examSelected === option
                                        ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                                        : ""
                                      : "hover:bg-accent"
                                  }`}
                                >
                                  <RadioGroupItem
                                    value={option}
                                    id={`exam-option-${idx}`}
                                    className="border-primary"
                                  />
                                  <Label
                                    htmlFor={`exam-option-${idx}`}
                                    className="flex-1 cursor-pointer py-2"
                                  >
                                    {option}
                                  </Label>
                                  {examSubmitted &&
                                    option ===
                                      examQuestions[examQuestionIdx]
                                        .correctAnswer && (
                                      <CheckCircle className="h-5 w-5 text-green-500" />
                                    )}
                                  {examSubmitted &&
                                    examSelected === option &&
                                    option !==
                                      examQuestions[examQuestionIdx]
                                        .correctAnswer && (
                                      <AlertCircle className="h-5 w-5 text-red-500" />
                                    )}
                                </div>
                              )
                            )}
                          </RadioGroup>
                          <div className="flex justify-between mt-4">
                            <Button variant="outline" onClick={handleExamRetry}>
                              Cancel
                            </Button>
                            {examSubmitted ? (
                              <Button onClick={handleExamNext}>
                                {examQuestionIdx < examQuestions.length - 1
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
                            <div
                              className={`mt-3 text-sm ${
                                examSelected ===
                                examQuestions[examQuestionIdx].correctAnswer
                                  ? "text-green-500"
                                  : "text-red-500"
                              }`}
                            >
                              {examSelected ===
                              examQuestions[examQuestionIdx].correctAnswer
                                ? "Correct! Good job."
                                : `Incorrect. The correct answer is: ${examQuestions[examQuestionIdx].correctAnswer}`}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="max-w-xl mx-auto bg-white dark:bg-card rounded-xl shadow-lg p-8 text-center">
                          <div className="text-2xl font-bold mb-4">
                            Exam Completed!
                          </div>
                          <div className="flex justify-center mb-6">
                            <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-4xl font-bold">
                                {Math.round(
                                  (examScore / examQuestions.length) * 100
                                )}
                                %
                              </span>
                            </div>
                          </div>
                          <div className="text-xl mb-2">
                            You scored {examScore} out of {examQuestions.length}
                          </div>
                          {examScore === examQuestions.length ? (
                            <div className="flex items-center justify-center gap-2 text-green-500 mb-4">
                              <CheckCircle />
                              <span>Perfect score! Great job!</span>
                            </div>
                          ) : (
                            <div className="text-muted-foreground mb-4">
                              Review the material and try again to improve your
                              score.
                            </div>
                          )}
                          <Button onClick={handleExamRetry}>Retry Exam</Button>
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
      <div className="fixed bottom-6 right-6 z-50"></div>
    </div>
  );
}

export default CourseLearnPage;
