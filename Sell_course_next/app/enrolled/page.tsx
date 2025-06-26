'use client'
import React, { useState } from 'react'
import { CourseSidebar } from '../../components/course/CourseSidebar'
import { LessonContent } from '../../components/course/LessonContent'
import { ExamComponent } from '../../components/course/ExamComponent'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Button } from '../../components/ui/button'
import { Progress } from '../../components/ui/progress'
import { ArrowLeft, BookOpen, GraduationCap } from 'lucide-react'

type Lesson = {
  id: number;
  title: string;
  type: 'video' | 'text' | 'quiz';
  duration: string;
  isCompleted: boolean;
  content:
    | { videoUrl: string; description: string }
    | { text: string }
    | { questions: number };
};

// Mock course data
const COURSE_DATA = {
  id: 1,
  title: 'Complete Web Development Bootcamp',
  instructor: 'Sarah Johnson',
  progress: 35,
  modules: [
    {
      id: 1,
      title: 'Introduction to HTML',
      lessons: [
        {
          id: 1,
          title: 'HTML Basics',
          type: 'video' as const,
          duration: '10:25',
          isCompleted: true,
          content: {
            videoUrl: 'https://example.com/video1.mp4',
            description:
              'Learn the fundamentals of HTML and how to create your first webpage.',
          },
        },
        {
          id: 2,
          title: 'HTML Elements',
          type: 'text' as const,
          duration: '15 mins read',
          isCompleted: true,
          content: {
            text: 'HTML elements are the building blocks of HTML pages. In this lesson, we will explore different HTML elements and their purposes.',
          },
        },
        {
          id: 3,
          title: 'HTML Forms',
          type: 'video' as const,
          duration: '12:40',
          isCompleted: false,
          content: {
            videoUrl: 'https://example.com/video2.mp4',
            description: 'Learn how to create interactive forms using HTML.',
          },
        },
        {
          id: 4,
          title: 'Module Quiz',
          type: 'quiz' as const,
          duration: '10 questions',
          isCompleted: false,
          content: {
            questions: 10,
          },
        },
      ],
    },
    {
      id: 2,
      title: 'CSS Fundamentals',
      lessons: [
        {
          id: 5,
          title: 'CSS Selectors',
          type: 'video' as const,
          duration: '14:30',
          isCompleted: false,
          content: {
            videoUrl: 'https://example.com/video3.mp4',
            description:
              'Learn about different CSS selectors and how to use them effectively.',
          },
        },
        {
          id: 6,
          title: 'CSS Box Model',
          type: 'text' as const,
          duration: '20 mins read',
          isCompleted: false,
          content: {
            text: 'The CSS box model is a fundamental concept that describes how elements are rendered on web pages.',
          },
        },
      ],
    },
  ],
  exams: [
    {
      id: 1,
      title: 'Mid-course Assessment',
      questions: 25,
      duration: '45 mins',
      isLocked: false,
    },
    {
      id: 2,
      title: 'Final Certification Exam',
      questions: 50,
      duration: '90 mins',
      isLocked: true,
    },
  ],
}

export function CourseLearnPage() {
  const [activeTab, setActiveTab] = useState('content')
  const [currentLesson, setCurrentLesson] = useState<Lesson>(
    COURSE_DATA.modules[0].lessons[0],
  )
  const handleLessonChange = (lesson: Lesson) => {
    setCurrentLesson(lesson)
    setActiveTab('content')
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
              <h1 className="text-lg font-semibold">{COURSE_DATA.title}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Instructor: {COURSE_DATA.instructor}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6 pr-5">
            <div className="flex flex-col gap-1 w-48">
              <div className="flex justify-between text-sm">
                <span>Course Progress</span>
                <span>{COURSE_DATA.progress}%</span>
              </div>
              <Progress value={COURSE_DATA.progress} className="h-2" />
            </div>
            <Button>Continue Learning</Button>
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="sticky top-20 h-[calc(100vh-5rem)] z-30">
          <CourseSidebar
            modules={COURSE_DATA.modules}
            currentLesson={currentLesson}
            onLessonSelect={(lesson) => {
              if ('content' in lesson) {
                handleLessonChange(lesson as Lesson)
              }
            }}
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
                <LessonContent lesson={currentLesson} />
              </TabsContent>
              <TabsContent value="exams" className="mt-0">
                <div className="grid md:grid-cols-2 gap-6">
                  {COURSE_DATA.exams.map((exam) => (
                    <ExamComponent key={exam.id} exam={exam} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}

export default CourseLearnPage;
