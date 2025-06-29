'use client'
import React, { useState, useEffect } from 'react'
import { CourseSidebar } from '../../../components/course/CourseSidebar'
import { LessonContent } from '../../../components/course/LessonContent'
import { ExamComponent } from '../../../components/course/ExamComponent'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { Button } from '../../../components/ui/button'
import { Progress } from '../../../components/ui/progress'
import { ArrowLeft, BookOpen, GraduationCap, Loader2 } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { 
  courseApi, 
  contentApi 
} from '../../api/courses/lessons/lessons'
import { examApi } from '../../api/courses/exam/exam'
import { resultExamApi } from '../../api/courses/exam/resultexam'
import {
  CourseData,
  LessonWithContent,
  ContentResponse,
  LessonResponse,
  CourseResponse,
  VideoResponse,
  DocumentResponse,
  QuizResponse
} from '../../types/Course/Lesson/Lessons'
import { ExamQuestion } from '../../types/exam/result-exam'
import { Exam } from '../../types/exam/exam'

// Use the Lesson type from CourseSidebar
type Lesson = {
  id: string
  title: string
  type: string
  isCompleted: boolean
  duration: string
  contents?: {
    contentId: string
    contentName: string
    contentType: string
  }[]
}

// Extended content type with completion status
type ContentWithCompletion = ContentResponse & {
  isCompleted: boolean;
};

// Real exam data interface
interface ExamData {
  examId: string
  courseId: string
  title: string
  questions: ExamQuestion[]
  totalQuestions: number
  isLocked: boolean
}

export function CourseLearnPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const { data: session } = useSession();
  
  const [activeTab, setActiveTab] = useState('content')
  const [courseData, setCourseData] = useState<CourseData | null>(null)
  const [currentLesson, setCurrentLesson] = useState<LessonWithContent | null>(null)
  const [currentContentId, setCurrentContentId] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Real exam state
  const [examData, setExamData] = useState<ExamData | null>(null)
  interface UserExamResults {
    score: number;
    // Add other fields as needed based on your API response
  }
  const [userExamResults, setUserExamResults] = useState<UserExamResults | null>(null)

  const [selectedContent, setSelectedContent] = useState<ContentResponse | null>(null);

  // Fetch course data and exam data from API
  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch course details
        const course = await courseApi.getCourseById(courseId) as CourseResponse;

        // Fetch lessons for this course
        const lessonsResponse = await courseApi.getLessonsByCourseId(courseId) as { lessons: LessonResponse[] };
        
        // Extract lessons from the response
        const lessons = lessonsResponse.lessons || [];

        // Process each lesson to get its contents
        const lessonsWithContent = await Promise.all(
          lessons.map(async (lesson: LessonResponse) => {
            try {
              // Use contents from the API response
              const contents = lesson.contents || [];

              // Determine lesson type and content based on first content
              let lessonType: 'video' | 'text' | 'quiz' = 'text';
              let lessonContent: VideoResponse | DocumentResponse | QuizResponse | { text: string } = { text: 'No content available' };
              let duration = '5 mins read';

              if (contents && contents.length > 0) {
                const firstContent = contents[0];

                try {
                  switch (firstContent.contentType.toLowerCase()) {
                    case 'video':
                      lessonType = 'video';
                      const videoContent = await contentApi.getVideoContent(firstContent.contentId) as VideoResponse;
                      lessonContent = videoContent;
                      duration = '10:25';
                      break;
                    case 'doc':
                      lessonType = 'text';
                      const docContent = await contentApi.getDocumentContent(firstContent.contentId) as DocumentResponse;
                      lessonContent = { text: docContent.url } as { text: string };
                      duration = '5 mins read';
                      break;
                    case 'quiz':
                      lessonType = 'quiz';
                      const quizContent = await contentApi.getQuizContent() as QuizResponse;
                      lessonContent = quizContent;
                      duration = `${quizContent.questions?.length || 0} questions`;
                      break;
                      
                    default:
                      lessonType = 'text';
                      lessonContent = { text: 'Content not available' };
                      duration = '5 mins read';
                  }
                } catch {
                  lessonType = 'text';
                  lessonContent = { text: 'Content not available' };
                  duration = '5 mins read';
                }

                const transformedLesson: LessonWithContent = {
                  id: lesson.lessonId,
                  title: lesson.lessonName,
                  type: lessonType,
                  duration,
                  isCompleted: false,
                  content: lessonContent,
                  contents: contents.map(content => ({
                    ...content,
                    isCompleted: false // Set to false initially, will be updated separately
                  }))
                };
                return transformedLesson;
              } else {
                // No contents available
                return {
                  id: lesson.lessonId,
                  title: lesson.lessonName,
                  type: 'text' as const,
                  duration: '5 mins read',
                  isCompleted: false,
                  content: { text: 'No content available' },
                  contents: []
                };
              }
            } catch {
              return {
                id: lesson.lessonId,
                title: lesson.lessonName,
                type: 'text' as const,
                duration: '5 mins read',
                isCompleted: false,
                content: { text: 'Error loading content' },
                contents: []
              };
            }
          })
        );

        // Fetch real exam data
        let examInfo: ExamData | null = null;
        try {
          // Check if exam exists for this course
          const examExists = await examApi.checkExamExists(courseId);
          
          if (examExists) {
            const exam = await examApi.getExamById(courseId) as Exam;
            
            // Check if user has taken the exam
            if (session?.accessToken) {
              try {
                const results = await resultExamApi.getUserExamResults(courseId, session.accessToken);
                setUserExamResults(results);
              } catch {
                // User hasn't taken the exam yet
              }
            }

            examInfo = {
              examId: exam.examId,
              courseId: exam.courseId,
              title: 'Final Certification Exam',
              questions: exam.questions.map(q => ({
                ...q,
                examId: exam.examId,
                createdAt: new Date().toISOString(),
                answers: q.answers.map(a => ({
                  ...a,
                  createdAt: new Date().toISOString(), // or use the correct value if available
                })),
              })),
              totalQuestions: exam.questions.length,
              isLocked: !session // Lock if user not authenticated
            };
          }
        } catch (examError) {
          console.log('No exam found for this course or error loading exam:', examError);
        }

        setExamData(examInfo);

        // Group lessons into modules (for now, just one module)
        const courseDataResult: CourseData = {
          id: course.courseId,
          title: course.title,
          instructor: course.instructorName || 'Unknown Instructor',
          progress: 35, // This should come from enrollment progress
          modules: [
            {
              id: '1',
              title: 'Course Content',
              lessons: lessonsWithContent
            }
          ],
          exams: [] // We'll handle exams separately with real data
        };

        setCourseData(courseDataResult);
        if (lessonsWithContent.length > 0) {
          setCurrentLesson(lessonsWithContent[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load course data');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, session]);

  const handleLessonChange = async (lesson: LessonWithContent) => {
    setCurrentLesson(lesson);
    setActiveTab('content');
  };

  const handleLessonSelect = (lesson: Lesson) => {
    // Find the corresponding LessonWithContent from our data
    const lessonWithContent = courseData?.modules[0].lessons.find(l => l.id === lesson.id);
    if (lessonWithContent) {
      handleLessonChange(lessonWithContent);
    }
  };

  const handleContentSelect = async (lessonId: string, contentId: string) => {
    setCurrentContentId(contentId);
    // Find and set the lesson containing this content
    const lesson = courseData?.modules[0].lessons.find((l: LessonWithContent) => l.id === lessonId);
    if (lesson) {
      setCurrentLesson(lesson);
    }
    const content = lesson?.contents?.find((c: ContentResponse) => c.contentId === contentId);
    setSelectedContent(content || null);
  };

  // Handle content completion
  const handleContentComplete = (contentId: string) => {
    setCourseData(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        modules: prev.modules.map(module => ({
          ...module,
          lessons: module.lessons.map(lesson => ({
            ...lesson,
            contents: lesson.contents?.map(content => 
              content.contentId === contentId 
                ? { ...content, isCompleted: true } as ContentWithCompletion
                : content as ContentWithCompletion
            ),
            // Mark lesson as completed if all contents are completed
            isCompleted: lesson.contents?.every(content => 
              content.contentId === contentId ? true : (content as ContentWithCompletion).isCompleted
            ) || false
          }))
        }))
      };
    });
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
            The course you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
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
        <aside className="sticky top-20 h-[calc(100vh-5rem)] z-30">
          <CourseSidebar
            modules={courseData.modules}
            currentLesson={currentLesson}
            currentContentId={currentContentId}
            onLessonSelect={handleLessonSelect}
            onContentSelect={handleContentSelect}
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
                {currentLesson && <LessonContent lesson={currentLesson} content={selectedContent} onContentComplete={handleContentComplete} />}
              </TabsContent>
              
              <TabsContent value="exams" className="mt-0">
                <div className="grid md:grid-cols-1 gap-6">
                  {!examData ? (
                    <div className="text-center py-8">
                      <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Exam Available</h3>
                      <p className="text-muted-foreground">
                        This course does not have an exam configured yet.
                      </p>
                    </div>
                  ) : (
                    <ExamComponent 
                      exam={examData} 
                      userExamResults={userExamResults} 
                      onExamComplete={(score) => {
                        // Update user exam results when exam is completed
                        setUserExamResults({ score });
                        // Optionally update course progress
                        setCourseData(prev => prev ? { 
                          ...prev, 
                          progress: Math.min(prev.progress + 10, 100) // Add 10% progress for completing exam
                        } : prev);
                      }} 
                    />
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