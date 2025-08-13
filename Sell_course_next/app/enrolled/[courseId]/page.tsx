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
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { courseApi as lessonApi, contentApi } from "../../api/courses/lessons/lessons";
import courseApi from "../../api/courses/courses";
import { examApi } from "../../api/courses/exam/exam";
import { resultExamApi } from "../../api/courses/exam/result-exam";
import {
  CourseData,
  LessonWithContent,
  ContentResponse,
  LessonResponse,
  CourseResponse,
  DocumentResponse,
  QuizResponse,
} from "../../types/Course/Lesson/Lessons";
import { ExamQuestion } from "../../types/Course/exam/result-exam";
import { Exam } from "../../types/Course/exam/exam";
import { VideoState } from "@/app/types/Course/Lesson/content/video";

import {
  ContentProgressStatus,
  CourseProgressResponse,
  LessonProgressResponseDto,
  CompletedCountResponse,
} from "@/app/types/Progress/progress";
import { useSession } from "next-auth/react";
import { createProgressTrackingAPI } from "@/app/api/Progress/progress";
import { useEnrollmentCheck } from "@/hooks/useEnrollmentCheck";
// Enhanced types for progress tracking
interface LessonWithProgress extends LessonResponse {
  isCompleted: boolean;
  completedContentsCount: number;
  totalContentsCount: number;
  contents: ContentWithProgress[];
}

interface ContentWithProgress extends ContentResponse {
  isCompleted: boolean;
}

// Real exam data interface
interface ExamData {
  examId: string;
  courseId: string;
  title: string;
  questions: ExamQuestion[];
  totalQuestions: number;
  isLocked: boolean;
}

// User exam results interface
interface UserExamResults {
  score: number;
  // Add other fields as needed based on your API response
}

export default function CourseLearnPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  // UI State
  const [activeTab, setActiveTab] = useState("content");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Course Data
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [lessons, setLessons] = useState<LessonWithProgress[]>([]);
  const [currentLesson, setCurrentLesson] = useState<LessonWithProgress | null>(
    null
  );
  const [currentContent, setCurrentContent] =
    useState<LessonWithContent | null>(null);
  const [selectedContent, setSelectedContent] =
    useState<ContentWithProgress | null>(null);

  // Progress State
  const [courseProgress, setCourseProgress] = useState<number>(0);
  const [completedContents, setCompletedContents] = useState<Set<string>>(
    new Set()
  );

  // Exam State
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [userExamResults, setUserExamResults] =
    useState<UserExamResults | null>(null);

  const token = session?.accessToken;
  const api = createProgressTrackingAPI(token || "");
  
  // Check enrollment status
  const { isEnrolled, isLoading: isCheckingEnrollment } = useEnrollmentCheck(courseId);
  
  // Load all progress data for the course
  const loadProgressData = async () => {
    if (!userId || !token || lessons.length === 0) return;

    try {
      const courseProgressData: CourseProgressResponse =
        await api.getCourseProgress(courseId, userId);
      setCourseProgress(courseProgressData.progress);

      const lessonsWithProgress = await Promise.all(
        lessons.map(async (lesson) => {
          try {
            // Get lesson progress
            const lessonProgress: LessonProgressResponseDto =
              await api.getLessonProgress(lesson.lessonId, userId);

            // Get completed contents count for this lesson
            const completedCount: CompletedCountResponse =
              await api.getCompletedContentsCount(lesson.lessonId, userId);

            // Get progress for each content in the lesson
            const contentsWithProgress = await Promise.all(
              lesson.contents.map(async (content) => {
                try {
                  const contentStatus: ContentProgressStatus =
                    await api.getContentStatus(content.contentId, userId);
                  return {
                    ...content,
                    isCompleted: contentStatus.isCompleted,
                  } as ContentWithProgress;
                } catch (error) {
                  console.warn(
                    `Failed to load status for content ${content.contentId}:`,
                    error
                  );
                  return {
                    ...content,
                    isCompleted: false,
                  } as ContentWithProgress;
                }
              })
            );

            return {
              ...lesson,
              isCompleted: lessonProgress.isCompleted,
              completedContentsCount: completedCount.completedContentsCount,
              totalContentsCount: lesson.contents.length,
              contents: contentsWithProgress,
            } as LessonWithProgress;
          } catch (error) {
            console.warn(
              `Failed to load progress for lesson ${lesson.lessonId}:`,
              error
            );
            return {
              ...lesson,
              isCompleted: false,
              completedContentsCount: 0,
              totalContentsCount: lesson.contents.length,
              contents: lesson.contents.map((content) => ({
                ...content,
                isCompleted: false,
              })) as ContentWithProgress[],
            } as LessonWithProgress;
          }
        })
      );

      setLessons(lessonsWithProgress);

      // Update completed contents set
      const allCompletedContents = new Set<string>();
      lessonsWithProgress.forEach((lesson) => {
        lesson.contents.forEach((content) => {
          if (content.isCompleted) {
            allCompletedContents.add(content.contentId);
          }
        });
      });
      setCompletedContents(allCompletedContents);

      // Update current lesson if it exists
      if (currentLesson) {
        const updatedCurrentLesson = lessonsWithProgress.find(
          (l) => l.lessonId === currentLesson.lessonId
        );
        if (updatedCurrentLesson) {
          setCurrentLesson(updatedCurrentLesson);
        }
      }

      console.log("✅ Progress data loaded successfully");
    } catch (error) {
      console.error("❌ Failed to load progress data:", error);
    }
  };

  // Load exam data
  const loadExamData = async () => {
    if (!courseId || !token) {
      console.log("❌ loadExamData - Missing courseId or token:", { courseId, token: !!token });
      return;
    }

    try {
      console.log("🎓 Loading exam data for course:", courseId);

      // Check if exam exists for this course
      console.log("🔍 Checking if exam exists with params:", { courseId, token: !!token });
      const examExists = await examApi.checkExamExists(courseId, token);

      if (examExists) {
        console.log("✅ Exam exists, fetching exam data...");
        const exam = (await examApi.getExamById(courseId, token)) as Exam;

        // Check if user has taken the exam
        if (token) {
          try {
            console.log("🔍 Checking user exam results...");
            const results = await resultExamApi.getUserExamResults(
              courseId,
              token
            );
            setUserExamResults(results);
            console.log("✅ User exam results loaded:", results);
          } catch (error) {
            // User hasn't taken the exam yet
            console.log("ℹ️ User hasn't taken the exam yet or error:", error);
          }
        }

        const examInfo: ExamData = {
          examId: exam.examId,
          courseId: exam.courseId,
          title: "Final Certification Exam",
          questions: exam.questions.map((q) => ({
            ...q,
            examId: exam.examId,
            createdAt: new Date().toISOString(),
            answers: q.answers.map((a) => ({
              ...a,
              createdAt: new Date().toISOString(),
            })),
          })),
          totalQuestions: exam.questions.length,
          isLocked: !session, // Lock if user not authenticated
        };

        setExamData(examInfo);
        console.log("✅ Exam data loaded successfully");
      } else {
        console.log("ℹ️ No exam found for this course");
        setExamData(null);
      }
    } catch (error) {
      console.error("❌ Failed to load exam data:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      setExamData(null);
    }
  };

  // Fetch course data from API
  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId || !userId || !token) return;
      // Only fetch course data if enrolled or user is admin
      if (!isEnrolled && session?.user?.role !== 'ADMIN') return;

      setLoading(true);
      setError(null);

      try {
        console.log("🔄 Fetching course data for:", courseId);

        // Fetch course details using enrolled endpoint (bypasses status check)
        const course = (await courseApi.getCourseByIdForEnrolled(
          courseId,
          token
        )) as CourseResponse;

        // Fetch lessons for this course
        const lessonsResponse = (await lessonApi.getLessonsByCourseId(
          courseId,
          token
        )) as { lessons: LessonResponse[] };
        const rawLessons = lessonsResponse.lessons || [];

        // Transform lessons to include progress structure
        const initialLessons: LessonWithProgress[] = rawLessons.map(
          (lesson) => ({
            ...lesson,
            isCompleted: false,
            completedContentsCount: 0,
            totalContentsCount: lesson.contents?.length || 0,
            contents: (lesson.contents || []).map((content) => ({
              ...content,
              isCompleted: false,
            })) as ContentWithProgress[],
          })
        );

        setLessons(initialLessons);

        // Process lessons for course data
        const lessonsWithContent = await Promise.all(
          initialLessons.map(async (lesson: LessonWithProgress) => {
            try {
              const contents = lesson.contents || [];
              let lessonType: "video" | "text" | "quiz" = "text";
              let lessonContent:
                | VideoState
                | DocumentResponse
                | QuizResponse
                | { text: string } = { text: "No content available" };
              let duration = "5 mins read";

              if (contents.length > 0) {
                const firstContent = contents[0];

                try {
                  switch (firstContent.contentType.toLowerCase()) {
                    case "video":
                      lessonType = "video";
                      const videoContent = (await contentApi.getVideoContent(
                        firstContent.contentId,
                        token
                      )) as VideoState;
                      lessonContent = videoContent;
                      duration = "Video";
                      break;
                    case "doc":
                      lessonType = "text";
                      const docContent = (await contentApi.getDocumentContent(
                        firstContent.contentId,
                        token
                      )) as DocumentResponse;
                      lessonContent = { text: docContent.url } as {
                        text: string;
                      };
                      duration = "5 mins read";
                      break;
                    case "quiz":
                      lessonType = "quiz";
                      const quizContent = (await contentApi.getQuizContent(
                        courseId,
                        lesson.lessonId,
                        firstContent.contentId,
                        token
                      )) as QuizResponse;
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

                return {
                  id: lesson.lessonId,
                  title: lesson.lessonName,
                  type: lessonType,
                  duration,
                  isCompleted: false, // Will be updated by progress loading
                  content: lessonContent,
                  contents: contents,
                } as LessonWithContent;
              } else {
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

        // Create course data
        const courseDataResult: CourseData = {
          id: course.courseId,
          title: course.title,
          instructor: course.instructorName || "Unknown Instructor",
          progress: 0, // Will be updated by progress loading
          modules: [
            {
              id: "1",
              title: "Course Content",
              lessons: lessonsWithContent,
            },
          ],
          exams: [], // Provide empty array if required by CourseData type
        };

        setCourseData(courseDataResult);

        // Set initial lesson and content
        if (initialLessons.length > 0) {
          setCurrentLesson(initialLessons[0]);
          if (lessonsWithContent.length > 0) {
            setCurrentContent(lessonsWithContent[0]);

            // Check if there's a contentId in URL params to restore user's position
            const urlContentId = searchParams.get("contentId");
            if (urlContentId) {
              // Find the content in any lesson
              const targetContent = initialLessons
                .flatMap((l) => l.contents)
                .find((c) => c.contentId === urlContentId);

              if (targetContent) {
                // Find the lesson containing this content
                const targetLesson = initialLessons.find((l) =>
                  l.contents.some((c) => c.contentId === urlContentId)
                );

                if (targetLesson) {
                  setCurrentLesson(targetLesson);
                  setSelectedContent(targetContent);

                  // Also set the corresponding LessonWithContent
                  const targetLessonWithContent = lessonsWithContent.find(
                    (l) => l.id === targetLesson.lessonId
                  );
                  if (targetLessonWithContent) {
                    setCurrentContent(targetLessonWithContent);
                  }
                }
              } else {
                // No contentId in URL, select first content
                if (initialLessons[0].contents.length > 0) {
                  setSelectedContent(initialLessons[0].contents[0]);
                }
              }
            } else {
              // No contentId in URL, select first content
              if (initialLessons[0].contents.length > 0) {
                setSelectedContent(initialLessons[0].contents[0]);
              }
            }
          }
        }

        // Load exam data
        await loadExamData();

        console.log("✅ Course data loaded successfully");
      } catch (err) {
        console.error("❌ Failed to load course data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load course data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, userId, isEnrolled]);

  // Load progress data after lessons are loaded
  useEffect(() => {
    if (lessons.length > 0 && userId) {
      loadProgressData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessons.length, userId]);

  // Update course data when progress changes
  useEffect(() => {
    if (lessons.length > 0) {
      setCourseData((prevCourseData) => {
        if (!prevCourseData) return null;

        const updatedCourseData = {
          ...prevCourseData,
          progress: courseProgress,
          modules: prevCourseData.modules.map((module) => ({
            ...module,
            lessons: module.lessons.map((lesson) => {
              const progressLesson = lessons.find(
                (l) => l.lessonId === lesson.id
              );
              if (progressLesson) {
                return {
                  ...lesson,
                  isCompleted: progressLesson.isCompleted,
                  contents: lesson.contents.map((content) => ({
                    ...content,
                    isCompleted: completedContents.has(content.contentId),
                  })),
                };
              }
              return lesson;
            }),
          })),
        };
        return updatedCourseData;
      });
    }
  }, [courseProgress, completedContents, lessons]);


  const isContentCompleted = (content: ContentResponse): boolean => {
    return completedContents.has(content.contentId);
  };

  // Handle lesson selection
  const handleLessonSelect = (lesson: LessonResponse) => {
    // Find the lesson with progress data
    const lessonWithProgress = lessons.find(
      (l) => l.lessonId === lesson.lessonId
    );
    if (lessonWithProgress) {
      setCurrentLesson(lessonWithProgress);
      setActiveTab("content");

      // Find the corresponding LessonWithContent from courseData
      const lessonWithContent = courseData?.modules[0].lessons.find(
        (l) => l.id === lesson.lessonId
      );
      if (lessonWithContent) {
        setCurrentContent(lessonWithContent);
      }

      // Set first content as selected if available and update URL
      if (lessonWithProgress.contents.length > 0) {
        const firstContent = lessonWithProgress.contents[0];
        setSelectedContent(firstContent);

        // Update URL params to preserve user's position
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.set("contentId", firstContent.contentId);
        router.replace(
          `${window.location.pathname}?${newSearchParams.toString()}`,
          { scroll: false }
        );
      }
    }
  };

  // Handle content selection
  const handleContentSelect = async (content: ContentResponse) => {
    // Find content with progress data
    const contentWithProgress = lessons
      .flatMap((l) => l.contents)
      .find((c) => c.contentId === content.contentId);

    if (contentWithProgress) {
      setSelectedContent(contentWithProgress);

      // Update URL params to preserve user's position
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set("contentId", content.contentId);
      router.replace(
        `${window.location.pathname}?${newSearchParams.toString()}`,
        { scroll: false }
      );

      // Find the lesson containing this content
      const lesson = lessons.find((l: LessonWithProgress) =>
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
    }
  };

  // Handle content completion
  const handleContentComplete = async (contentId: string) => {
    if (!currentLesson || !userId || !token) {
      console.log("❌ CourseLearnPage - Missing currentLesson or userId");
      return;
    }

    try {
      console.log(
        "✅ CourseLearnPage - Marking content as completed:",
        contentId
      );

      // Mark content as completed via API
      await api.markAsCompleted(
        userId,
        contentId,
        currentLesson.lessonId
      );

      // Update local state immediately for better UX
      setCompletedContents((prev) => new Set([...Array.from(prev), contentId]));

      // Refresh progress data to get updated counts and completion status
      await loadProgressData();

      console.log(
        "✅ CourseLearnPage - Content marked as completed successfully"
      );
    } catch (error) {
      console.error(
        "❌ CourseLearnPage - Failed to mark content as completed:",
        error
      );
      setError("Failed to save progress. Please try again.");

      // Still update local state for better UX even if API fails
      setCompletedContents((prev) => new Set([...Array.from(prev), contentId]));
    }
  };

  // Handle exam completion
  const handleExamComplete = (score: number) => {
    console.log("🎓 Exam completed with score:", score);

    // Update user exam results
    setUserExamResults({ score });

    // Optionally update course progress
    setCourseData((prev) =>
      prev
        ? {
            ...prev,
            progress: Math.min(prev.progress + 10, 100), // Add 10% progress for completing exam
          }
        : prev
    );

    // Refresh progress data
    if (userId) {
      loadProgressData();
    }
  };

  // Handle tab change with validation
  const handleTabChange = (value: string) => {
    if (value === "exams" && courseProgress < 100) {
      // Don't allow switching to exam tab if progress is not 100%
      return;
    }
    setActiveTab(value);
  };

  // Check enrollment status before rendering content
  if (status === 'loading' || isCheckingEnrollment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Checking enrollment...</p>
        </div>
      </div>
    );
  }
  
  if (!isEnrolled && session?.user?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto space-y-4">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-semibold">Access Restricted</h2>
            <p className="text-muted-foreground">Bạn chưa enroll khóa học này. Vui lòng enroll trước khi học.</p>
            <Button asChild>
              <a href={`/courses/${courseId}`}>Go to Course Page</a>
            </Button>
        </div>
      </div>
    );
  }

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
          <p className="mb-4">{error}</p>
          <Button asChild>
            <a href="/">Go Home</a>
          </Button>
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
        <div className="mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
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
          <div className="flex items-center gap-6">
            <div className="flex flex-col gap-1 w-48">
              <div className="flex justify-between text-sm">
                <span>Course Progress</span>
                <span>{Math.round(courseProgress)}%</span>
              </div>
              <Progress value={courseProgress} className="h-2" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 px-4 md:px-6 py-4 gap-6">
        {/* Sidebar */}
        <aside className="sticky top-20 h-[calc(100vh-5rem)] z-30">
          <CourseSidebar
            lessons={lessons} // Pass lessons with progress data
            currentLesson={currentLesson}
            currentContent={currentContent}
            onLessonSelect={handleLessonSelect}
            onContentSelect={handleContentSelect}
            isContentCompleted={isContentCompleted}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
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
                <TabsTrigger 
                  value="exams" 
                  className="flex items-center gap-2"
                  disabled={courseProgress < 100}
                >
                  <GraduationCap className="h-4 w-4" />
                  Exams & Assessments
                  {courseProgress < 100 && (
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full ml-2">
                      Complete course first
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="mt-0">
                {currentContent && (
                  <LessonContent
                    key={selectedContent?.contentId || currentContent.id} // force remount on content change
                    lesson={currentContent}
                    content={selectedContent}
                    onContentComplete={handleContentComplete}
                    courseId={courseId}
                    isContentCompleted={
                      selectedContent ? completedContents.has(selectedContent.contentId) : false
                    }
                    token={token || ""}
                  />
                )}
              </TabsContent>

              <TabsContent value="exams" className="mt-0">
                <div className="grid md:grid-cols-1 gap-6">
                  {courseProgress < 100 ? (
                    <div className="text-center py-8 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <GraduationCap className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2 text-yellow-800 dark:text-yellow-200">
                        Complete Course to Unlock Exam
                      </h3>
                      <p className="text-yellow-700 dark:text-yellow-300 mb-4">
                        You need to complete all course content (100% progress) before taking the exam.
                      </p>
                      <div className="max-w-xs mx-auto">
                        <div className="flex justify-between text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                          <span>Current Progress</span>
                          <span>{Math.round(courseProgress)}%</span>
                        </div>
                        <Progress 
                          value={courseProgress} 
                          className="h-2"
                        />
                      </div>
                      <Button
                        onClick={() => setActiveTab("content")}
                        className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-white"
                      >
                        Continue Learning
                      </Button>
                    </div>
                  ) : !examData ? (
                    <div className="text-center py-8">
                      <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No Exam Available
                      </h3>
                      <p className="text-muted-foreground">
                        This course does not have an exam configured yet.
                      </p>
                    </div>
                  ) : (
                    <ExamComponent
                      exam={examData}
                      userExamResults={userExamResults}
                      onExamComplete={handleExamComplete}
                    />
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      <div className="fixed bottom-6 right-6 z-50"></div>
      {/* Learning Path Modal */}
    </div>
  );
}
