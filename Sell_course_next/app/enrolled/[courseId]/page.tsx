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
import {
  ArrowLeft,
  BookOpen,
  Brain,
  Eye,
  GraduationCap,
  Loader2,
} from "lucide-react";
import { useParams } from "next/navigation";
import { courseApi, contentApi } from "../../api/courses/lessons/lessons";
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
  markContentAsCompleted,
  getLessonProgress,
  getCourseProgress,
  getContentStatus,
  getCompletedContentsCount,
} from "../../api/Progress/progress";
import {
  ContentProgressStatus,
  CourseProgressResponse,
  LessonProgressResponseDto,
  CompletedCountResponse,
} from "@/app/types/Progress/progress";
import { useSession } from "next-auth/react";
import LearningPathModal, {
  LearningPathInput,
} from "@/components/course/LearningPathModal";
import improvedLearningPathApi from "@/app/api/learningPath/learningPathAPI";
import {
  isLearningPathData,
  isLearningPlan,
  LearningPathData,
} from "@/app/types/learningPath/learningPath";
import UpdatedLearningPathDisplay from "@/components/course/LearningPathDisplay";
import { toast } from "sonner";

interface LearningPathState {
  data: LearningPathData | null;
  planId: string | null;
  isExisting: boolean;
  isLoading: boolean;
}

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
  const courseId = params.courseId as string;
  const { data: session } = useSession();
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

  // Learning Path states
  const [showLearningPathModal, setShowLearningPathModal] = useState(false);
  const [showLearningPathDisplay, setShowLearningPathDisplay] = useState(false);
  const [learningPathState, setLearningPathState] = useState<LearningPathState>(
    {
      data: null,
      planId: null,
      isExisting: false,
      isLoading: false,
    }
  );
  const [isCreatingLearningPath, setIsCreatingLearningPath] = useState(false);
  const [currentLearningPathInput, setCurrentLearningPathInput] =
    useState<LearningPathInput | null>(null);
  const [hasExistingPlan, setHasExistingPlan] = useState<boolean | null>(null);
  const [isCheckingPlan, setIsCheckingPlan] = useState(false);

  // Exam State
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [userExamResults, setUserExamResults] =
    useState<UserExamResults | null>(null);

  const token = session?.accessToken;
  // Check for existing learning plan
  useEffect(() => {
    const checkExistingPlan = async () => {
      if (!userId || !userId || !token) {
        setHasExistingPlan(false);
        return;
      }

      try {
        setIsCheckingPlan(true);
        if (!userId) {
          setHasExistingPlan(false);
          setIsCheckingPlan(false);
          return;
        }
        const response = await improvedLearningPathApi.hasLearningPlanForCourse(
          userId,
          courseId,
          token
        );

        if (response.success) {
          setHasExistingPlan(response.data || false);
        } else {
          console.error("Error checking existing plan:", response.error);
          setHasExistingPlan(false);
        }
      } catch (error) {
        console.error("Error checking existing plan:", error);
        setHasExistingPlan(false);
      } finally {
        setIsCheckingPlan(false);
      }
    };

    checkExistingPlan();
  }, [userId, courseId]);
  // Load all progress data for the course
  const loadProgressData = async () => {
    if (!userId || !token || lessons.length === 0) return;

    try {
      const courseProgressData: CourseProgressResponse =
        await getCourseProgress(courseId, userId, token);
      setCourseProgress(courseProgressData.progress);

      const lessonsWithProgress = await Promise.all(
        lessons.map(async (lesson) => {
          try {
            // Get lesson progress
            const lessonProgress: LessonProgressResponseDto =
              await getLessonProgress(lesson.lessonId, userId, token);

            // Get completed contents count for this lesson
            const completedCount: CompletedCountResponse =
              await getCompletedContentsCount(lesson.lessonId, userId, token);

            // Get progress for each content in the lesson
            const contentsWithProgress = await Promise.all(
              lesson.contents.map(async (content) => {
                try {
                  const contentStatus: ContentProgressStatus =
                    await getContentStatus(content.contentId, userId, token);
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

  // Learning Path handlers
  const handleCreateLearningPath = () => {
    if (!session) {
      toast.error("please login to view Learning Path", {
        style: {
          background: "#ef4444",
          color: "white",
          border: "1px solid #dc2626",
        },
        icon: "❌",
      });
      return;
    }
    setShowLearningPathModal(true);
  };

  const handleViewLearningPath = async () => {
    if (!session?.user?.id || !token) {
      toast.error("please login to view Learning Path", {
        style: {
          background: "#ef4444",
          color: "white",
          border: "1px solid #dc2626",
        },
        icon: "❌",
      });
      return;
    }

    try {
      setLearningPathState((prev) => ({ ...prev, isLoading: true }));

      const response =
        await improvedLearningPathApi.getLatestLearningPathForCourse(
          session.user.id,
          courseId,
          token
        );

      if (response.success && response.data) {
        // Get plan ID
        const planResponse =
          await improvedLearningPathApi.getLatestLearningPlanForCourse(
            session.user.id,
            courseId,
            token
          );

        setLearningPathState({
          data: response.data,
          planId: planResponse.data?.planId || null,
          isExisting: true,
          isLoading: false,
        });
        setShowLearningPathDisplay(true);
      } else {
        toast.error("Error viewing learning path", {
          style: {
            background: "#ef4444",
            color: "white",
            border: "1px solid #dc2626",
          },
          icon: "❌",
        });
        setLearningPathState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error("Error viewing learning path:", error);
      toast.error("have an error while viewing learning path", {
        style: {
          background: "#ef4444",
          color: "white",
          border: "1px solid #dc2626",
        },
        icon: "❌",
      });
      setLearningPathState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleLearningPathSubmit = async (
    learningPathInput: LearningPathInput
  ) => {
    if (!session?.user?.id || !token) {
      toast.error("please login to create learning path", {
        style: {
          background: "#ef4444",
          color: "white",
          border: "1px solid #dc2626",
        },
        icon: "❌",
      });
      return;
    }
    setIsCreatingLearningPath(true);

    try {
      // Store input for later use when saving
      setCurrentLearningPathInput(learningPathInput);

      // Call API to generate learning path
      const response = await improvedLearningPathApi.generateLearningPath(
        learningPathInput,
        token
      );

      if (response.success && response.data) {
        if (!isLearningPathData(response.data)) {
          throw new Error("Invalid learning path data format");
        }

        setLearningPathState({
          data: response.data,
          planId: null,
          isExisting: false,
          isLoading: false,
        });
        setShowLearningPathModal(false);
        setShowLearningPathDisplay(true);
      } else {
        toast.error("have an error creating learning path", {
          style: {
            background: "#ef4444",
            color: "white",
            border: "1px solid #dc2626",
          },
          icon: "❌",
        });
      }
    } catch (error) {
      toast.error("have an error creating learning path", {
        style: {
          background: "#ef4444",
          color: "white",
          border: "1px solid #dc2626",
        },
        icon: "❌",
      });
      console.error("Error creating learning path:", error);
    } finally {
      setIsCreatingLearningPath(false);
    }
  };

  const handleSaveLearningPath = async (
    data: LearningPathData
  ): Promise<void> => {
    if (!session?.user?.id || !currentLearningPathInput || !token) {
      throw new Error(
        "dont have user id or currentLearningPathInput or token "
      );
    }

    if (!isLearningPathData(data)) {
      throw new Error("Invalid learning path data format");
    }

    try {
      let response;

      if (learningPathState.planId) {
        // Update existing learning path
        response = await improvedLearningPathApi.updateLearningPath(
          learningPathState.planId,
          data,
          token
        );
      } else {
        // Save new learning path
        response = await improvedLearningPathApi.saveLearningPath(
          session.user.id,
          courseId,
          data,
          currentLearningPathInput,
          token
        );
      }

      if (response.success && response.data) {
        if (!isLearningPlan(response.data)) {
          throw new Error("Invalid learning plan response format");
        }

        setLearningPathState((prev) => ({
          ...prev,
          data: data,
          planId: response.data!.planId,
          isExisting: true,
        }));

        // Update hasExistingPlan state
        setHasExistingPlan(true);
        toast.success("Learning Path saved successfully!", {
          style: {
            background: "#10b981",
            color: "white",
            border: "1px solid #059669",
          },
          icon: "✅",
        });
      } else {
        throw new Error(response.error || "Failed to save learning path");
      }
    } catch (error) {
      console.error("Error saving learning path:", error);
      throw error;
    }
  };
  // Load exam data
  const loadExamData = async () => {
    if (!courseId || !token) return;

    try {
      console.log("🎓 Loading exam data for course:", courseId);

      // Check if exam exists for this course
      const examExists = await examApi.checkExamExists(courseId, token);

      if (examExists) {
        const exam = (await examApi.getExamById(courseId, token)) as Exam;

        // Check if user has taken the exam
        if (token) {
          try {
            const results = await resultExamApi.getUserExamResults(
              courseId,
              token
            );
            setUserExamResults(results);
          } catch {
            // User hasn't taken the exam yet
            console.log("User hasn't taken the exam yet");
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
        console.log("No exam found for this course");
        setExamData(null);
      }
    } catch (error) {
      console.error("❌ Failed to load exam data:", error);
      setExamData(null);
    }
  };

  // Fetch course data from API
  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId || !userId || !token) return;

      setLoading(true);
      setError(null);

      try {
        console.log("🔄 Fetching course data for:", courseId);

        // Fetch course details
        const course = (await courseApi.getCourseById(
          courseId,
          token
        )) as CourseResponse;

        // Fetch lessons for this course
        const lessonsResponse = (await courseApi.getLessonsByCourseId(
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
                      duration = "10:25";
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
  }, [courseId, userId]);

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

      // Set first content as selected if available
      if (lessonWithProgress.contents.length > 0) {
        setSelectedContent(lessonWithProgress.contents[0]);
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
      await markContentAsCompleted(
        userId,
        contentId,
        currentLesson.lessonId,
        token
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

  const renderLearningPathButton = () => {
    if (!session) return null;

    if (isCheckingPlan) {
      return (
        <Button
          disabled
          className="w-full bg-gradient-to-r from-gray-400 to-gray-500 text-white py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg mt-3"
        >
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Đang kiểm tra...
        </Button>
      );
    }

    if (hasExistingPlan) {
      return (
        <Button
          onClick={handleViewLearningPath}
          disabled={learningPathState.isLoading}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-2xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 mt-3"
        >
          {learningPathState.isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading...
            </>
          ) : (
            <>
              <Eye className="w-5 h-5 mr-2" />
              View Learning Path
            </>
          )}
        </Button>
      );
    }

    return (
      <Button
        onClick={handleCreateLearningPath}
        disabled={isCreatingLearningPath}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 mt-3"
      >
        {isCreatingLearningPath ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Created...
          </>
        ) : (
          <>
            <Brain className="w-5 h-5 mr-2" />
            Create Learning Path
          </>
        )}
      </Button>
    );
  };

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
                <span>{Math.round(courseProgress)}%</span>
              </div>
              <Progress value={courseProgress} className="h-2" />
            </div>
            {/* Action Buttons */}
            <div className="mb-6 space-y-3">{renderLearningPathButton()}</div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="sticky top-20 h-[calc(100vh-5rem)] z-30">
          <CourseSidebar
            lessons={lessons} // Pass lessons with progress data
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
                    courseId={courseId}
                    isContentCompleted={
                      selectedContent ? selectedContent.isCompleted : false
                    }
                    token={token || ""}
                  />
                )}
              </TabsContent>

              <TabsContent value="exams" className="mt-0">
                <div className="grid md:grid-cols-1 gap-6">
                  {!examData ? (
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
      <LearningPathModal
        isOpen={showLearningPathModal}
        onClose={() => setShowLearningPathModal(false)}
        onSubmit={handleLearningPathSubmit}
        courseId={courseId}
        userId={session?.user?.id || ""}
        userName={session?.user?.name || "Nguyễn Văn A"}
        token={token || ""}
      />

      {/* Learning Path Display */}
      {learningPathState.data && (
        <UpdatedLearningPathDisplay
          isOpen={showLearningPathDisplay}
          onClose={() => setShowLearningPathDisplay(false)}
          onSave={handleSaveLearningPath}
          data={learningPathState.data}
          isEditable={true}
          planId={learningPathState.planId}
          isExisting={learningPathState.isExisting}
          token={token || ""}
        />
      )}
    </div>
  );
}
