"use client";
import React, { useState } from "react";
import {
  ChevronDown,
  CheckCircle,
  Play,
  FileText,
  HelpCircle,
  Clock,
  BookOpen,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import {
  ContentResponse,
  LessonResponse,
  LessonWithContent,
} from "@/app/types/Course/Lesson/Lessons";

interface CourseSidebarProps {
  lessons: LessonResponse[];
  currentLesson: LessonResponse | null;
  currentContent: LessonWithContent | null;
  onLessonSelect: (lesson: LessonResponse) => void;
  onContentSelect: (content: ContentResponse) => void;
  isContentCompleted: (content: ContentResponse) => boolean;
}

export function CourseSidebar({
  lessons,
  currentLesson,
  currentContent,
  onLessonSelect,
  onContentSelect,
  isContentCompleted,
}: CourseSidebarProps) {
  const [openLessons, setOpenLessons] = useState<string[]>([
    lessons[0]?.lessonId,
  ]);

  const toggleLesson = (lessonId: string) => {
    setOpenLessons((prev) =>
      prev.includes(lessonId)
        ? prev.filter((id) => id !== lessonId)
        : [...prev, lessonId]
    );
  };

  const getContentIcon = (contentType: string, isCompleted: boolean) => {
    // Always show completion status first
    if (isCompleted) return <CheckCircle className="h-4 w-4 text-green-500" />;

    // Show type-specific icons for uncompleted content
    switch (contentType.toLowerCase()) {
      case "video":
        return <Play className="h-4 w-4 text-blue-500" />;
      case "doc":
        return <FileText className="h-4 w-4 text-gray-500" />;
      case "quiz":
        return <HelpCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLessonProgress = (lesson: LessonResponse) => {
    if (!lesson.contents || lesson.contents.length === 0) return 0;
    const completedCount = lesson.contents.filter((content) =>
      isContentCompleted(content)
    ).length;
    return Math.round((completedCount / lesson.contents.length) * 100);
  };

  const isLessonCompleted = (lesson: LessonResponse) => {
    return getLessonProgress(lesson) === 100;
  };

  const getLessonCompletionStats = (lesson: LessonResponse) => {
    if (!lesson.contents || lesson.contents.length === 0) {
      return { completed: 0, total: 0 };
    }

    const completed = lesson.contents.filter((content) =>
      isContentCompleted(content)
    ).length;
    const total = lesson.contents.length;

    return { completed, total };
  };

  return (
    <div className="w-80 border-r bg-card/50 overflow-y-auto max-h-[calc(100vh-4rem)]">
      <div className="p-4 font-semibold border-b bg-background sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Course Lessons
        </div>
      </div>

      <div className="p-0">
        {lessons.map((lesson) => {
          const lessonProgress = getLessonProgress(lesson);
          const isCompleted = isLessonCompleted(lesson);
          const { completed, total } = getLessonCompletionStats(lesson);

          return (
            <Collapsible
              key={lesson.lessonId}
              open={openLessons.includes(lesson.lessonId)}
              onOpenChange={() => toggleLesson(lesson.lessonId)}
              className="border-b"
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-between rounded-none h-auto py-4 px-4 text-left",
                    currentLesson &&
                      currentLesson.lessonId === lesson.lessonId &&
                      "bg-accent"
                  )}
                  onClick={() => onLessonSelect(lesson)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {lesson.order || 1}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm leading-tight mb-1 break-words whitespace-normal">
                        {lesson.lessonName}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{total} items</span>
                        {total > 0 && (
                          <>
                            <span>•</span>
                            <span
                              className={cn(
                                "font-medium",
                                isCompleted
                                  ? "text-green-600"
                                  : "text-muted-foreground"
                              )}
                            >
                              {completed}/{total} completed
                            </span>
                          </>
                        )}
                        {lessonProgress > 0 && (
                          <>
                            <span>•</span>
                            <span
                              className={cn(
                                "font-medium",
                                isCompleted ? "text-green-600" : "text-blue-600"
                              )}
                            >
                              {lessonProgress}%
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-200 flex-shrink-0",
                      openLessons.includes(lesson.lessonId) ? "rotate-180" : ""
                    )}
                  />
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="">
                {lesson.contents && lesson.contents.length > 0 && (
                  <div className="py-2">
                    {lesson.contents
                      .sort((a, b) => a.order - b.order)
                      .map((content) => {
                        const isCompleted = isContentCompleted(content);
                        const isCurrentContent = currentContent?.contents?.some(
                          (c) => c.contentId === content.contentId
                        );

                        return (
                          <Button
                            key={content.contentId}
                            variant="ghost"
                            className={cn(
                              "w-full justify-start rounded-none h-auto py-3 px-8 text-left border-l-2 hover:bg-accent/50",
                              isCurrentContent
                                ? "border-l-primary bg-accent/80"
                                : "border-l-transparent",
                              // Add visual indicator for completed content
                              isCompleted &&
                                "bg-green-50/50 dark:bg-green-950/10"
                            )}
                            onClick={() => onContentSelect(content)}
                          >
                            <div className="flex items-center gap-3 w-full">
                              <div className="flex-shrink-0">
                                {getContentIcon(
                                  content.contentType,
                                  isCompleted
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div
                                  className={cn(
                                    "font-medium text-sm leading-tight mb-1 break-words whitespace-normal",
                                    isCompleted &&
                                      "text-green-700"
                                  )}
                                >
                                  {content.contentName || content.contentId}
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                  <Clock className="h-3 w-3" />
                                  {isCompleted && (
                                    <>
                                      <span className="text-muted-foreground">
                                        •
                                      </span>
                                      <span className="text-green-600 font-medium flex items-center gap-1">
                                        <CheckCircle className="h-3 w-3" />
                                        Completed
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                              {/* Additional completion indicator on the right */}
                              {isCompleted && (
                                <div className="flex-shrink-0">
                                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                </div>
                              )}
                            </div>
                          </Button>
                        );
                      })}
                  </div>
                )}
                {(!lesson.contents || lesson.contents.length === 0) && (
                  <div className="px-8 py-4 text-sm text-muted-foreground">
                    No content available for this lesson
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>

      {lessons.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-sm">No lessons available</p>
        </div>
      )}
    </div>
  );
}
