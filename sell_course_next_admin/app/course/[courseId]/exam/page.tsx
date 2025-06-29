'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Button } from '../../../../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs'
import { Alert, AlertDescription } from '../../../../components/ui/alert'
import { Badge } from '../../../../components/ui/badge'
import { 
  BookOpen, 
  FileText, 
  Plus, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'

// Import the components from your existing files
import { ExamForm } from '../../../../components/exam/ExamForm'
import { ExamList } from '../../../../components/exam/ExamList'
import { CreateExamFromQuizzesForm } from '../../../../components/exam/CreateExamFromQuizzesForm'

// Import the real API instead of mock
import { examApi } from '../../../api/exam/exam'
import { 
  Exam, 
  ExamQuestion, 
  CreateExamQuestionDto, 
  AvailableQuiz,
  ExamCreationConfig,
  UpdateExamQuestionDto
} from '../../../types/exam'

interface ExamPageProps {
  params: {
    courseId: string;
  }
}

function ExamPageContent({ params }: ExamPageProps) {
  const { courseId } = params

  const [exam, setExam] = useState<Exam | null>(null)
  const [availableQuizzes, setAvailableQuizzes] = useState<AvailableQuiz[]>([])
  const [editingQuestion, setEditingQuestion] = useState<ExamQuestion | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  const loadExamData = useCallback(async () => {
    setInitialLoading(true)
    setError('')
    
    try {
      // Try to load existing exam
      try {
        const examData = await examApi.getExamById(courseId)
        setExam(examData)
        setActiveTab('overview')
      } catch {
        // No exam exists yet, load available quizzes for creation
        setExam(null)
        setActiveTab('create-from-quizzes')
      }

      // Always load available quizzes
      const quizzes = await examApi.getAvailableQuizzes(courseId)
      setAvailableQuizzes(quizzes)
      
    } catch (err) {
      setError('Failed to load exam data')
      console.error(err)
    } finally {
      setInitialLoading(false)
    }
  }, [courseId])

  // Load exam and available quizzes on component mount
  useEffect(() => {
    if (courseId) {
      loadExamData()
    }
  }, [courseId, loadExamData])

  const handleCreateExamFromQuizzes = async (config: ExamCreationConfig) => {
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      const newExam = await examApi.createExamFromQuizzes(courseId, config)
      setExam(newExam)
      setSuccess('Exam created successfully from quizzes!')
      setActiveTab('overview')
    } catch (err) {
      setError('Failed to create exam from quizzes')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCustomExam = async (questions: CreateExamQuestionDto[]) => {
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      const newExam = await examApi.createExam({ courseId, questions })
      setExam(newExam)
      setSuccess('Custom exam created successfully!')
      setActiveTab('overview')
    } catch (err) {
      setError('Failed to create custom exam')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSyncWithQuizzes = async () => {
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      const updatedExam = await examApi.syncExamWithQuizzes(courseId)
      setExam(updatedExam)
      setSuccess('Exam synced with latest quiz questions!')
    } catch (err) {
      setError('Failed to sync exam with quizzes')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEditQuestion = (question: ExamQuestion) => {
    setEditingQuestion(question)
  }

  const handleUpdateQuestion = async (questionId: string, updatedData: UpdateExamQuestionDto) => {
    setLoading(true)
    setError('')
    
    try {
      const updatedQuestion = await examApi.updateQuestion(questionId, updatedData)
      
      if (exam) {
        setExam({
          ...exam,
          questions: exam.questions.map(q => 
            q.questionId === questionId ? updatedQuestion : q
          )
        })
      }
      
      setEditingQuestion(null)
      setSuccess('Question updated successfully!')
    } catch (err) {
      setError('Failed to update question')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return
    
    setLoading(true)
    setError('')
    
    try {
      await examApi.deleteQuestion(questionId)
      
      if (exam) {
        setExam({
          ...exam,
          questions: exam.questions.filter(q => q.questionId !== questionId)
        })
      }
      
      setSuccess('Question deleted successfully!')
    } catch (err) {
      setError('Failed to delete question')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddQuestion = async () => {
    if (!exam) return
    
    setLoading(true)
    setError('')
    
    try {
      // Note: addQuestion method doesn't exist in examApi
      // You'll need to implement this method or use a different approach
      setError('Add question functionality not implemented yet')
    } catch (err) {
      setError('Failed to add question')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingQuestion(null)
  }

  // Clear success/error messages after a delay
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('')
        setError('')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [success, error])

  if (initialLoading) {
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading exam data...</p>
        </div>
      </div>
    )
  }

  if (!courseId) {
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Missing Course ID</h2>
          <p className="text-muted-foreground mb-4">
            Course ID is required to manage exams. Please navigate from the course page.
          </p>
          <Link href="/course">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="container max-w-7xl px-4 py-8">
        <div className="flex flex-col space-y-6">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link 
              href="/course" 
              className="hover:text-primary transition-colors"
            >
              Courses
            </Link>
            <span>/</span>
            <Link 
              href={`/course/${courseId}`}
              className="hover:text-primary transition-colors"
            >
              Course Details
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">Exam Manager</span>
          </div>

          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href={`/course/${courseId}`}
                className="flex items-center justify-center w-10 h-10 rounded-lg border hover:bg-accent transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    Exam Manager
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Create and manage exam questions for this course
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">Course: {courseId.slice(-8)}</Badge>
                    {exam && <Badge variant="secondary">Exam: {exam.examId.slice(-8)}</Badge>}
                  </div>
                </div>
              </div>
            </div>
            
            {exam && (
              <Button
                onClick={handleSyncWithQuizzes}
                disabled={loading}
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync with Quizzes
              </Button>
            )}
          </div>

          {/* Status Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" disabled={!exam}>
                <FileText className="h-4 w-4 mr-2" />
                Exam Overview
              </TabsTrigger>
              <TabsTrigger value="create-from-quizzes">
                <BookOpen className="h-4 w-4 mr-2" />
                Create from Quizzes
              </TabsTrigger>
              <TabsTrigger value="create-custom">
                <Plus className="h-4 w-4 mr-2" />
                Create Custom
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {exam ? (
                <ExamList
                  exam={exam}
                  onEditQuestion={handleEditQuestion}
                  onDeleteQuestion={handleDeleteQuestion}
                  onAddQuestion={handleAddQuestion}
                  editingQuestion={editingQuestion}
                  onUpdateQuestion={handleUpdateQuestion}
                  onCancelEdit={handleCancelEdit}
                  loading={loading}
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Exam Found</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Create an exam from your quizzes or build a custom exam to get started.
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={() => setActiveTab('create-from-quizzes')}>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Create from Quizzes
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab('create-custom')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Custom
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="create-from-quizzes">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Create Exam from Quizzes
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Generate an exam using questions from your existing quizzes in this course
                  </p>
                </CardHeader>
                <CardContent>
                  <CreateExamFromQuizzesForm
                    availableQuizzes={availableQuizzes}
                    onSubmit={handleCreateExamFromQuizzes}
                    loading={loading}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="create-custom">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Create Custom Exam
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Build an exam with custom questions and answers
                  </p>
                </CardHeader>
                <CardContent>
                  <ExamForm
                    onSubmit={handleCreateCustomExam}
                    loading={loading}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function ExamPageLoading() {
  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading exam page...</p>
      </div>
    </div>
  )
}

export default function ExamPage({ params }: ExamPageProps) {
  return (
    <Suspense fallback={<ExamPageLoading />}>
      <ExamPageContent params={params} />
    </Suspense>
  )
}