"use client";
import React, { useState } from "react";
import {
  ChevronDown,
  CheckCircle,
  Play,
  FileText,
  HelpCircle,
  Video,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Content, Lesson } from "@/app/types/Course/Lesson/Lessons";

interface Content {
  contentId: string;
  contentName: string;
  contentType: string;
  isCompleted?: boolean;
}

interface Lesson {
  id: string;
  title: string;
  type: string;
  isCompleted: boolean;
  duration: string;
  contents?: Content[];
}

interface CourseSidebarProps {
  modules: Array<{
    id: string;
    title: string;
    lessons: Lesson[];
  }>;
  currentLesson: Lesson | null;
  currentContentId?: string;
  onLessonSelect: (lesson: Lesson) => void;
  onContentSelect?: (lessonId: string, contentId: string) => void;
}

export function CourseSidebar({
  lessons,
  currentLesson,
  currentContentId,
  onLessonSelect,
  onContentSelect,
}: CourseSidebarProps) {
  // Flatten all lessons from all modules
  const allLessons = modules.flatMap((module) => module.lessons);
  const [openLessons, setOpenLessons] = useState<string[]>([]);

  const toggleLesson = (lessonId: string) => {
    setOpenLessons((prev) =>
      prev.includes(lessonId)
        ? prev.filter((id) => id !== lessonId)
        : [...prev, lessonId]
    );
  };

  const getLessonIcon = (type: string, isCompleted: boolean) => {
    if (isCompleted) return <CheckCircle className="h-4 w-4 text-green-500" />;

    switch (contentType) {
      case "video":
        return <Play className="h-4 w-4" />;
      case "doc":
        return <FileText className="h-4 w-4" />;
      case "quiz":
        return <HelpCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getContentIcon = (contentType: string) => {
    switch (contentType.toLowerCase()) {
      case "video":
        return <Video className="h-3 w-3" />;
      case "doc":
        return <FileText className="h-3 w-3" />;
      case "quiz":
        return <HelpCircle className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  return (
    <div className="w-72 border-r bg-card/50 overflow-y-auto max-h-[calc(100vh-4rem)]">
      <div className="p-4 font-medium border-b">Course Content</div>

      <div className="p-0">
        {allLessons.map((lesson: Lesson) => (
          <Collapsible
            key={lesson.id}
            open={openLessons.includes(lesson.id)}
            onOpenChange={() => toggleLesson(lesson.id)}
            className="border-b"
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-between rounded-none h-auto py-3 px-4 border-l-2",
                  currentLesson?.id === lesson.id
                    ? "border-l-primary bg-accent"
                    : "border-l-transparent hover:bg-accent/50"
                )}
                onClick={() => onLessonSelect(lesson)}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="flex-shrink-0">
                    {getLessonIcon(lesson.type, lesson.isCompleted)}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-sm font-medium truncate">
                      {lesson.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {lesson.duration}
                    </div>
                  </div>
                  {lesson.contents && lesson.contents.length > 0 && (
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200 flex-shrink-0",
                        openLessons.includes(lesson.id) ? "rotate-180" : ""
                      )}
                    />
                  )}
                </div>
              </Button>
            </CollapsibleTrigger>
            {lesson.contents && lesson.contents.length > 0 && (
              <CollapsibleContent className="px-0">
                <ul>
                  {lesson.contents.map((content: Content) => (
                    <li key={content.contentId}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start rounded-none h-auto py-2 px-8 text-left text-xs hover:bg-accent/30",
                          currentContentId === content.contentId
                            ? "bg-primary/10 border-l-2 border-l-primary font-semibold text-primary"
                            : ""
                        )}
                        onClick={() =>
                          onContentSelect?.(lesson.id, content.contentId)
                        }
                      >
                        <div className="flex items-center gap-2 w-full">
                          <div className="flex-shrink-0">
                            {getContentIcon(content.contentType)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                              {content.contentName}
                            </div>
                            <div className="text-xs text-muted-foreground capitalize">
                              {content.contentType}
                            </div>
                          </div>
                          {content.isCompleted && (
                            <div className="flex-shrink-0">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            </div>
                          )}
                        </div>
                      </Button>
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            )}
          </Collapsible>
        ))}
      </div>

      <div className="p-0">
        {lessons.map((lesson) => {
          const lessonProgress = getLessonProgress(lesson);
          const isCompleted = isLessonCompleted(lesson);

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
                            {lesson.order}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm leading-tight mb-1">
                        {lesson.lessonName}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{lesson.contents?.length || 0} items</span>
                        {lessonProgress > 0 && (
                          <>
                            <span>•</span>
                            <span>{lessonProgress}% complete</span>
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
                        const duration = getContentDuration(content);

                        return (
                          <Button
                            key={content.contentId}
                            variant="ghost"
                            className={cn(
                              "w-full justify-start rounded-none h-auto py-3 px-8 text-left border-l-2 hover:bg-accent/50",
                              currentContent?.contentId === content.contentId
                                ? "border-l-primary bg-accent/80"
                                : "border-l-transparent"
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
                                <div className="text-sm font-medium truncate mb-1">
                                  {content.contentName}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>{duration}</span>
                                  {isCompleted && (
                                    <>
                                      <span>•</span>
                                      <span className="text-green-600">
                                        Completed
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Button>
                        );
                      })}
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}
