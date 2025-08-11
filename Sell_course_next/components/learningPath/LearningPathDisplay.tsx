"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Target,
  FileText,
  HelpCircle,
  ArrowLeft,
  GraduationCap,
  CheckCircle,
  Circle,
  PlayCircle,
  BarChart3,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  ContentItem,
  ContentProgress,
  CourseItem,
  LearningPathProgress,
  LearningPlanData,
  LessonItem,
  NarrativeItem,
} from "@/app/types/learningPath/learningPath";
import { createLearningPathAPI } from "@/app/api/learningPath/learningPathAPI";
import { useRouter } from "next/navigation";

interface LearningPathDisplayProps {
  learningPlan: LearningPlanData;
  userId: string;
  token: string;
  onBack: () => void;
}

export default function LearningPathDisplay({
  learningPlan,
  userId,
  token,
  onBack,
}: LearningPathDisplayProps) {
  const [contentProgress, setContentProgress] = useState<
    Record<string, ContentProgress>
  >({});
  const [pathProgress, setPathProgress] = useState<LearningPathProgress | null>(
    null
  );
  const route = useRouter();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const api = createLearningPathAPI(token);

  // Determine enrollment status heuristically from progress data
  const isEnrolled = React.useMemo(() => {
    // If any content has progress (in_progress or completed) treat as enrolled
    return Object.values(contentProgress).some(
      (p) => p.status === "completed" || p.status === "in_progress"
    );
  }, [contentProgress]);

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        setLoading(true);
        const allContentIds = extractAllContentIds(learningPlan);

        // Fetch bulk progress status
        const progressData = await api.getBulkContentProgress(
          userId,
          allContentIds
        );
        setContentProgress(progressData);

        // Fetch overall learning path progress
        const pathProgressData = await api.getLearningPathProgress(
          userId,
          allContentIds
        );
        setPathProgress(pathProgressData);
      } catch (error) {
        console.error("Failed to fetch progress data:", error);
        toast.error("Failed to load progress data");
      } finally {
        setLoading(false);
      }
    };
    fetchProgressData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [learningPlan.planId, userId, token, learningPlan]);

  const extractAllContentIds = (plan: LearningPlanData): string[] => {
    const contentIds: string[] = [];
    plan.learningPathCourses.forEach((course) => {
      course.lessons.forEach((lesson) => {
        lesson.contents.forEach((content) => {
          contentIds.push(content.contentId);
        });
      });
    });
    return contentIds;
  };

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const getProgressIcon = (contentId: string) => {
    const progress = contentProgress[contentId];
    if (!progress) return <Circle className="w-5 h-5 text-gray-400" />;

    switch (progress.status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "in_progress":
        return <PlayCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getProgressColor = (contentId: string) => {
    const progress = contentProgress[contentId];
    if (!progress) return "border-gray-200";

    switch (progress.status) {
      case "completed":
        return "border-green-200 bg-green-50";
      case "in_progress":
        return "border-blue-200 bg-blue-50";
      default:
        return "border-gray-200";
    }
  };

  const renderNarrativeContent = (
    item: NarrativeItem,
    index: number,
    prefix: string
  ) => {
    let content = item.template;
    Object.entries(item.bindings).forEach(([key, value]) => {
      content = content.replace(
        new RegExp(`{{${key}}}`, "g"),
        String(value || "")
      );
    });

    const getIcon = () => {
      if (content.includes("Tổng quan") || content.includes("🌟"))
        return <FileText className="w-5 h-5 text-blue-500" />;
      if (content.includes("câu hỏi") || content.includes("🧪"))
        return <HelpCircle className="w-5 h-5 text-purple-500" />;
      if (content.includes("quiz") || content.includes("kiểm tra"))
        return <Target className="w-5 h-5 text-green-500" />;
      if (content.includes("🎥"))
        return <BookOpen className="w-5 h-5 text-red-500" />;
      if (content.includes("📝"))
        return <FileText className="w-5 h-5 text-orange-500" />;
      return <BookOpen className="w-5 h-5 text-gray-500" />;
    };

    const itemId = `${prefix}-narrative-${index}`;
    const isExpanded = expandedItems.has(itemId);
    const shouldShowToggle = content.length > 200;

    return (
      <div
        key={index}
        className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
      >
        <div
          className={`p-4 ${
            shouldShowToggle ? "cursor-pointer" : ""
          } hover:bg-gray-50 transition-colors`}
          onClick={() => shouldShowToggle && toggleExpanded(itemId)}
        >
          <div className="flex items-start gap-3">
            {getIcon()}
            <div className="flex-1">
              <p
                className={`text-gray-700 leading-relaxed ${
                  !isExpanded && shouldShowToggle ? "line-clamp-3" : ""
                }`}
              >
                {isExpanded || !shouldShowToggle
                  ? content
                  : `${content.substring(0, 200)}...`}
              </p>
            </div>
            {shouldShowToggle && (
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderContentItem = (
    content: ContentItem,
    courseIndex: number,
    lessonIndex: number,
    contentIndex: number
  ) => {
    const contentId = `course-${courseIndex}-lesson-${lessonIndex}-content-${contentIndex}`;
    const isExpanded = expandedItems.has(contentId);
    const progress = contentProgress[content.contentId];

    const getTypeIcon = (type: string) => {
      switch (type.toLowerCase()) {
        case "video":
          return (
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-red-600" />
            </div>
          );
        case "doc":
        case "document":
          return (
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
          );
        case "quiz":
        case "quizz":
          return (
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-green-600" />
            </div>
          );
        default:
          return (
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-gray-600" />
            </div>
          );
      }
    };

    return (
      <div
        key={content.contentId}
        className={`rounded-lg p-4 border-2 transition-colors ${getProgressColor(
          content.contentId
        )}`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {getTypeIcon(content.type)}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {getProgressIcon(content.contentId)}
                <h5 className="font-medium text-gray-900">{content.title}</h5>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <Clock className="w-4 h-4" />
                <span>{content.durationMin} phút</span>
                <span className="px-2 py-1 bg-gray-200 rounded-full text-xs">
                  {content.type}
                </span>
                {progress && progress.timeSpentMinutes > 0 && (
                  <span className="text-blue-600 text-xs">
                    {progress.timeSpentMinutes}m spent
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleExpanded(contentId)}
              className="text-gray-400 hover:text-gray-600"
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {progress && progress.progressPercentage > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span>{progress.progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {isExpanded &&
          content.narrativeText &&
          content.narrativeText.length > 0 && (
            <div className="mt-4 space-y-3">
              {content.narrativeText.map((narrative, index) =>
                renderNarrativeContent(narrative, index, contentId)
              )}
            </div>
          )}
      </div>
    );
  };

  const renderLessonItem = (
    lesson: LessonItem,
    courseIndex: number,
    lessonIndex: number
  ) => {
    const lessonId = `course-${courseIndex}-lesson-${lessonIndex}`;
    const isExpanded = expandedItems.has(lessonId);

    // Calculate lesson progress
    const lessonContentIds = lesson.contents.map((c) => c.contentId);
    const completedInLesson = lessonContentIds.filter(
      (id) => contentProgress[id]?.status === "completed"
    ).length;
    const lessonProgress =
      lessonContentIds.length > 0
        ? Math.round((completedInLesson / lessonContentIds.length) * 100)
        : 0;

    return (
      <div
        key={lesson.lessonId}
        className="bg-white rounded-lg border border-gray-200 shadow-sm"
      >
        <div
          className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => toggleExpanded(lessonId)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{lesson.title}</h4>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>
                    {lesson.contents.length} nội dung •{" "}
                    {lesson.contents.reduce(
                      (total, content) => total + content.durationMin,
                      0
                    )}{" "}
                    phút
                  </span>
                  <span className="text-blue-600 font-medium">
                    {lessonProgress}% completed
                  </span>
                </div>
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Lesson Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${lessonProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="px-4 pb-4 space-y-4">
            {lesson.narrativeText && lesson.narrativeText.length > 0 && (
              <div className="space-y-3">
                {lesson.narrativeText.map((narrative, index) =>
                  renderNarrativeContent(narrative, index, lessonId)
                )}
              </div>
            )}

            <div className="space-y-3">
              <h5 className="font-medium text-gray-900">Lesson Content:</h5>
              {lesson.contents.map((content, contentIndex) =>
                renderContentItem(
                  content,
                  courseIndex,
                  lessonIndex,
                  contentIndex
                )
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCourseItem = (course: CourseItem, courseIndex: number) => {
    const courseId = `course-${courseIndex}`;
    const isExpanded = expandedItems.has(courseId);

    return (
      <div
        key={course.courseId}
        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 shadow-lg"
      >
        <div
          className="p-6 cursor-pointer hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 transition-colors"
          onClick={() => toggleExpanded(courseId)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {course.title}
                </h3>
                <p className="text-gray-600">
                  {course.lessons.length} bài học •{" "}
                  {course.lessons.reduce(
                    (total, lesson) =>
                      total +
                      lesson.contents.reduce(
                        (lessonTotal, content) =>
                          lessonTotal + content.durationMin,
                        0
                      ),
                    0
                  )}{" "}
                  phút
                </p>
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              {isExpanded ? (
                <ChevronUp className="w-6 h-6" />
              ) : (
                <ChevronDown className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="px-6 pb-6 space-y-6">
            {course.narrativeText && course.narrativeText.length > 0 && (
              <div className="space-y-3">
                {course.narrativeText.map((narrative, index) =>
                  renderNarrativeContent(narrative, index, courseId)
                )}
              </div>
            )}

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Lesson:</h4>
              {course.lessons.map((lesson, lessonIndex) =>
                renderLessonItem(lesson, courseIndex, lessonIndex)
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const goToCourse = () => {
    const targetCourseId = learningPlan.courseId || learningPlan.learningPathCourses[0]?.courseId;
    if (!targetCourseId) return;
    if (isEnrolled) {
      route.push(`/enrolled/${targetCourseId}`);
    } else {
      route.push(`/courses/${targetCourseId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading learning path details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {learningPlan.targetLearningPath.topic}
                </h1>
                <p className="text-sm text-gray-600">
                  Created{" "}
                  {new Date(learningPlan.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={goToCourse}
                className="flex items-center gap-2"
              >
                <Rocket className="w-4 h-4" />
                {isEnrolled ? "Continue Learning" : "Go to Course"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Learning Path Overview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Learning Overview
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">
                    Learning Goal
                  </h3>
                  <p className="text-gray-900">
                    {learningPlan.targetLearningPath.learning_goal}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">
                      Current Level
                    </h3>
                    <p className="text-gray-900">
                      {learningPlan.targetLearningPath.current_level}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">
                      Target Level
                    </h3>
                    <p className="text-gray-900">
                      {learningPlan.targetLearningPath.target_level}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">
                    Duration
                  </h3>
                  <p className="text-gray-900">
                    {learningPlan.targetLearningPath.desired_duration}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">
                    Learning Styles
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {learningPlan.targetLearningPath.preferred_learning_styles.map(
                      (style, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {style}
                        </span>
                      )
                    )}
                  </div>
                </div>

                {/* Progress Overview */}
                {pathProgress && (
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart3 className="w-4 h-4 text-green-600" />
                      <h3 className="text-sm font-medium text-gray-700">
                        Progress Overview
                      </h3>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Overall Progress</span>
                          <span className="font-medium">
                            {pathProgress.overallProgressPercentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${pathProgress.overallProgressPercentage}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className="text-green-600 font-semibold">
                            {pathProgress.completedContents}
                          </div>
                          <div className="text-gray-600">Completed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-blue-600 font-semibold">
                            {pathProgress.inProgressContents}
                          </div>
                          <div className="text-gray-600">In Progress</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-600 font-semibold">
                            {pathProgress.notStartedContents}
                          </div>
                          <div className="text-gray-600">Not Started</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>
                          {Math.floor(pathProgress.totalTimeSpent / 60)}h{" "}
                          {pathProgress.totalTimeSpent % 60}m spent
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Learning Path Courses */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Learning Path Courses
                </h2>
              </div>

              {learningPlan.learningPathCourses.map((course, courseIndex) =>
                renderCourseItem(course, courseIndex)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
