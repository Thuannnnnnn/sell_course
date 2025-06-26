'use client'
import React, { useState } from 'react'
import {
  ChevronDown,
  CheckCircle,
  Play,
  FileText,
  HelpCircle,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible'

interface Lesson {
  id: number
  title: string
  type: string
  isCompleted: boolean
  duration: string
}

interface Module {
  id: number
  title: string
  lessons: Lesson[]
}

interface CourseSidebarProps {
  modules: Module[]
  currentLesson: Lesson
  onLessonSelect: (lesson: Lesson) => void
}

export function CourseSidebar({
  modules,
  currentLesson,
  onLessonSelect,
}: CourseSidebarProps) {
  const [openModules, setOpenModules] = useState<number[]>([1])
  const toggleModule = (moduleId: number) => {
    setOpenModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId],
    )
  }
  const getLessonIcon = (type: string, isCompleted: boolean) => {
    if (isCompleted) return <CheckCircle className="h-4 w-4 text-green-500" />
    switch (type) {
      case 'video':
        return <Play className="h-4 w-4" />
      case 'text':
        return <FileText className="h-4 w-4" />
      case 'quiz':
        return <HelpCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }
  return (
    <div className="w-72 border-r bg-card/50 overflow-y-auto max-h-[calc(100vh-4rem)]">
      <div className="p-4 font-medium border-b">Course Content</div>
      <div className="p-0">
        {modules.map((module) => (
          <Collapsible
            key={module.id}
            open={openModules.includes(module.id)}
            onOpenChange={() => toggleModule(module.id)}
            className="border-b"
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between rounded-none h-auto py-3 px-4"
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium">{module.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {module.lessons.length} lessons
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform duration-200',
                    openModules.includes(module.id) ? 'rotate-180' : '',
                  )}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-0">
              <ul>
                {module.lessons.map((lesson: Lesson) => (
                  <li key={lesson.id}>
                    <Button
                      variant="ghost"
                      className={cn(
                        'w-full justify-start rounded-none h-auto py-3 px-6 text-left border-l-2',
                        currentLesson.id === lesson.id
                          ? 'border-l-primary bg-accent'
                          : 'border-l-transparent',
                      )}
                      onClick={() => onLessonSelect(lesson)}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="flex-shrink-0">
                          {getLessonIcon(lesson.type, lesson.isCompleted)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {lesson.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {lesson.duration}
                          </div>
                        </div>
                      </div>
                    </Button>
                  </li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  )
}
