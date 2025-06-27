'use client'
import React, { useState } from 'react'
import {
  ChevronDown,
  CheckCircle,
  Play,
  FileText,
  HelpCircle,
  Clock,
  BookOpen,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible'
import { Content, Lesson } from '@/app/types/Course/Lesson/Lessons'



interface CourseSidebarProps {
  lessons: Lesson[]
  currentLesson: Lesson | null
  currentContent: Content | null
  onLessonSelect: (lesson: Lesson) => void
  onContentSelect: (content: Content) => void
  getContentDuration: (content: Content) => string
  isContentCompleted: (content: Content) => boolean
}

export function CourseSidebar({
  lessons,
  currentLesson,
  currentContent,
  onLessonSelect,
  onContentSelect,
  getContentDuration,
  isContentCompleted,
}: CourseSidebarProps) {
  const [openLessons, setOpenLessons] = useState<string[]>([lessons[0]?.lessonId])

  const toggleLesson = (lessonId: string) => {
    setOpenLessons((prev) =>
      prev.includes(lessonId)
        ? prev.filter((id) => id !== lessonId)
        : [...prev, lessonId],
    )
  }

  const getContentIcon = (contentType: string, isCompleted: boolean) => {
    if (isCompleted) return <CheckCircle className="h-4 w-4 text-green-500" />
    
    switch (contentType) {
      case 'video':
        return <Play className="h-4 w-4 text-blue-500" />
      case 'text':
        return <FileText className="h-4 w-4 text-gray-500" />
      case 'quiz':
        return <HelpCircle className="h-4 w-4 text-orange-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const getLessonProgress = (lesson: Lesson) => {
    if (!lesson.contents || lesson.contents.length === 0) return 0
    const completedCount = lesson.contents.filter(content => 
      isContentCompleted(content)
    ).length
    return Math.round((completedCount / lesson.contents.length) * 100)
  }

  const isLessonCompleted = (lesson: Lesson) => {
    return getLessonProgress(lesson) === 100
  }

  return (
    <div className="w-80 border-r bg-card/50 overflow-y-auto max-h-[calc(100vh-4rem)]">
      <div className="p-4 font-semibold border-b bg-background/50 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Course Lesson
        </div>
      </div>
      
      <div className="p-0">
        {lessons.map((lesson) => {
          const lessonProgress = getLessonProgress(lesson)
          const isCompleted = isLessonCompleted(lesson)
          
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
                    currentLesson && currentLesson.lessonId === lesson.lessonId && "bg-accent"
                  )}
                  onClick={() => onLessonSelect(lesson)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center">
                          <span className="text-xs font-medium">{lesson.order}</span>
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
                      'h-4 w-4 transition-transform duration-200 flex-shrink-0',
                      openLessons.includes(lesson.lessonId) ? 'rotate-180' : '',
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
                        const isCompleted = isContentCompleted(content)
                        const duration = getContentDuration(content)
                        
                        return (
                          <Button
                            key={content.contentId}
                            variant="ghost"
                            className={cn(
                              'w-full justify-start rounded-none h-auto py-3 px-8 text-left border-l-2 hover:bg-accent/50',
                              currentContent?.contentId === content.contentId
                                ? 'border-l-primary bg-accent/80'
                                : 'border-l-transparent',
                            )}
                            onClick={() => onContentSelect(content)}
                          >
                            <div className="flex items-center gap-3 w-full">
                              <div className="flex-shrink-0">
                                {getContentIcon(content.contentType, isCompleted)}
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
                                      <span className="text-green-600">Completed</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Button>
                        )
                      })}
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          )
        })}
      </div> 
    </div>
  )
}