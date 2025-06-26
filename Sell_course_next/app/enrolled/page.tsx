'use client'
import React, { useState } from 'react'
import { CourseSidebar } from '../../components/course/CourseSidebar'
import { LessonContent } from '../../components/course/LessonContent'
import { ExamComponent } from '../../components/course/ExamComponent'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Button } from '../../components/ui/button'
import { Progress } from '../../components/ui/progress'
import { ArrowLeft, BookOpen, GraduationCap } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group'
import { Label } from '../../components/ui/label'
import { CheckCircle, AlertCircle } from 'lucide-react'

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
  // Exam state
  const [activeExamId, setActiveExamId] = useState<number | null>(null)
  const [examQuestionIdx, setExamQuestionIdx] = useState(0)
  const [examSelected, setExamSelected] = useState<string | null>(null)
  const [examSubmitted, setExamSubmitted] = useState(false)
  const [examScore, setExamScore] = useState(0)
  const [examCompleted, setExamCompleted] = useState(false)

  // Mock exam questions (replace with real data as needed)
  const examQuestions = [
    {
      id: 1,
      question: 'What is CSS used for?',
      options: [
        'Structuring web content',
        'Styling web pages',
        'Programming logic',
        'Database management',
      ],
      correctAnswer: 'Styling web pages',
    },
    {
      id: 2,
      question: 'Which property changes text color in CSS?',
      options: ['font-size', 'color', 'background', 'text-align'],
      correctAnswer: 'color',
    },
    {
      id: 3,
      question: 'How do you select an element with id="main" in CSS?',
      options: ['#main', '.main', 'main', '*main'],
      correctAnswer: '#main',
    },
  ]

  const handleLessonChange = (lesson: Lesson) => {
    setCurrentLesson(lesson)
    setActiveTab('content')
  }

  // Exam logic
  const handleStartExam = (examId: number) => {
    setActiveExamId(examId)
    setExamQuestionIdx(0)
    setExamSelected(null)
    setExamSubmitted(false)
    setExamScore(0)
    setExamCompleted(false)
  }
  const handleExamSubmit = () => {
    if (!examSelected) return
    setExamSubmitted(true)
    if (examSelected === examQuestions[examQuestionIdx].correctAnswer) {
      setExamScore((prev) => prev + 1)
    }
  }
  const handleExamNext = () => {
    if (examQuestionIdx < examQuestions.length - 1) {
      setExamQuestionIdx((idx) => idx + 1)
      setExamSelected(null)
      setExamSubmitted(false)
    } else {
      setExamCompleted(true)
    }
  }
  const handleExamRetry = () => {
    setExamQuestionIdx(0)
    setExamSelected(null)
    setExamSubmitted(false)
    setExamScore(0)
    setExamCompleted(false)
    setActiveExamId(null)
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
                  {activeExamId === null ? (
                    COURSE_DATA.exams.map((exam) => (
                      <div key={exam.id} className="bg-white dark:bg-card rounded-xl shadow-lg p-6 flex flex-col gap-4">
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
                              Question {examQuestionIdx + 1} of {examQuestions.length}
                            </div>
                            <div className="text-sm font-medium">
                              Score: {examScore}/{examQuestionIdx}
                            </div>
                          </div>
                          <Progress value={((examQuestionIdx + 1) / examQuestions.length) * 100} className="mb-8" />
                          <div className="mb-6 text-lg font-semibold">
                            {examQuestions[examQuestionIdx].question}
                          </div>
                          <RadioGroup
                            value={examSelected || ''}
                            onValueChange={setExamSelected}
                            disabled={examSubmitted}
                          >
                            {examQuestions[examQuestionIdx].options.map((option, idx) => (
                              <div
                                key={idx}
                                className={`flex items-center space-x-2 border p-4 rounded-md mb-2 ${examSubmitted ? (option === examQuestions[examQuestionIdx].correctAnswer ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : examSelected === option ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : '') : 'hover:bg-accent'}`}
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
                                  option === examQuestions[examQuestionIdx].correctAnswer && (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                  )}
                                {examSubmitted &&
                                  examSelected === option &&
                                  option !== examQuestions[examQuestionIdx].correctAnswer && (
                                    <AlertCircle className="h-5 w-5 text-red-500" />
                                  )}
                              </div>
                            ))}
                          </RadioGroup>
                          <div className="flex justify-between mt-4">
                            <Button
                              variant="outline"
                              onClick={handleExamRetry}
                            >
                              Cancel
                            </Button>
                            {examSubmitted ? (
                              <Button onClick={handleExamNext}>
                                {examQuestionIdx < examQuestions.length - 1
                                  ? 'Next Question'
                                  : 'Finish Exam'}
                              </Button>
                            ) : (
                              <Button onClick={handleExamSubmit} disabled={!examSelected}>
                                Submit Answer
                              </Button>
                            )}
                          </div>
                          {examSubmitted && (
                            <div
                              className={`mt-3 text-sm ${examSelected === examQuestions[examQuestionIdx].correctAnswer ? 'text-green-500' : 'text-red-500'}`}
                            >
                              {examSelected === examQuestions[examQuestionIdx].correctAnswer
                                ? 'Correct! Good job.'
                                : `Incorrect. The correct answer is: ${examQuestions[examQuestionIdx].correctAnswer}`}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="max-w-xl mx-auto bg-white dark:bg-card rounded-xl shadow-lg p-8 text-center">
                          <div className="text-2xl font-bold mb-4">Exam Completed!</div>
                          <div className="flex justify-center mb-6">
                            <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-4xl font-bold">
                                {Math.round((examScore / examQuestions.length) * 100)}%
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
                              Review the material and try again to improve your score.
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
    </div>
  )
}

export default CourseLearnPage;
