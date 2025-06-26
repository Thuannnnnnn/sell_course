'use client';

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import QuestionForm from '../../../../../../components/quiz/QuestionForm'
import QuestionList from '../../../../../../components/quiz/QuestionList'
import { BookOpen, Save, AlertCircle, ArrowLeft, Plus, Eraser } from 'lucide-react'
import { Button } from '../../../../../../components/ui/button'
import { Alert, AlertDescription } from '../../../../../../components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../../components/ui/card'
import { Badge } from '../../../../../../components/ui/badge'
import { QuizFormData } from '../../../../../types/quiz'
import { useQuiz } from '../../../../../../hooks/useQuiz'
import { quizApi } from '../../../../../api/quiz/quiz'
import Link from 'next/link'

interface QuizPageProps {
  params: {
    courseId: string;
    lessonId: string;
  }
}

function QuizPageContent({ params }: QuizPageProps) {
  const { courseId, lessonId } = params
  const router = useRouter()
  const searchParams = useSearchParams()
  const contentId = searchParams.get('contentId')
  const quizId = searchParams.get('quizId')

  // All hooks must be called before any early returns
  const [editingQuestion, setEditingQuestion] = useState<QuizFormData | null>(null)
  const [deletingAllQuestions, setDeletingAllQuestions] = useState(false)
  
  const {
    questions,
    loading,
    saving,
    error,
    success,
    newQuizId,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    loadQuiz,
    saveQuiz
  } = useQuiz({ courseId: courseId || undefined, lessonId: lessonId || undefined, contentId: contentId || undefined, quizId: quizId || undefined })
  
  // Handle redirect after quiz creation
  useEffect(() => {
    if (newQuizId && !quizId) {
      const newUrl = `/course/${courseId}/${lessonId}/contents/quiz?contentId=${contentId}&quizId=${newQuizId}`;
      router.push(newUrl);
    }
  }, [newQuizId, quizId, courseId, lessonId, contentId, router]);

  // Clear newQuizId when we already have a quizId
  useEffect(() => {
    if (quizId && newQuizId) {
      // clearMessages(); // This would clear success message too
    }
  }, [quizId, newQuizId]);

  // Load existing quiz data
  useEffect(() => {
    if (courseId && lessonId && contentId && quizId) {
      loadQuiz()
    }
  }, [courseId, lessonId, contentId, quizId, loadQuiz])

  // Validation: contentId is required
  if (!contentId) {
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Missing Content ID</h2>
          <p className="text-muted-foreground mb-4">
            Content ID is required to manage quizzes. Please navigate from the content page.
          </p>
          <Link href={`/course/${courseId}/${lessonId}/contents`}>
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Contents
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleAddQuestion = (question: QuizFormData) => {

    addQuestion(question)
  }

  const handleEditQuestion = (question: QuizFormData) => {

    updateQuestion(question)
    setEditingQuestion(null)
  }

  const handleDeleteQuestion = (id: string) => {

    deleteQuestion(id)
  }

  const startEditQuestion = (question: QuizFormData) => {

    setEditingQuestion(question)
  }

  const handleSaveQuiz = async () => {
    await saveQuiz()
  }

  const handleDeleteAllQuestions = async () => {
    if (!courseId || !lessonId || !contentId || !quizId) {
      console.error('❌ Missing required parameters for delete all questions');
      return;
    }

    if (questions.length === 0) {
      alert('No questions to delete.');
      return;
    }

    if (!confirm(`Are you sure you want to delete all ${questions.length} questions? This action cannot be undone.`)) {
      return;
    }

    setDeletingAllQuestions(true);
    try {

      
      const result = await quizApi.deleteAllQuestions(courseId, lessonId, contentId, quizId);
      

      
      // Reload the quiz to refresh the questions list
      await loadQuiz();
      
      alert(`✅ Successfully deleted ${result.deletedCount} questions!`);
      
    } catch (err) {
      console.error('❌ Error deleting all questions:', err);
      const error = err as Error & { response?: { data?: { message?: string } } };
      alert(`Error: ${error.response?.data?.message || error.message || 'Failed to delete questions'}`);
    } finally {
      setDeletingAllQuestions(false);
    }
  }
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading quiz data...</p>
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
            <Link 
              href={`/course/${courseId}/${lessonId}/contents`}
              className="hover:text-primary transition-colors"
            >
              Lesson Contents
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">Quiz Manager</span>
          </div>

          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href={`/course/${courseId}/${lessonId}/contents`}
                className="flex items-center justify-center w-10 h-10 rounded-lg border hover:bg-accent transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    Quiz Manager
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Create and manage quiz questions for this content
                  </p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge variant="outline">Course: {courseId.slice(-8)}</Badge>
                    <Badge variant="outline">Lesson: {lessonId.slice(-8)}</Badge>
                    <Badge variant="outline">Content: {contentId.slice(-8)}</Badge>
                    {quizId && <Badge variant="secondary">Quiz: {quizId.slice(-8)}</Badge>}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {questions.length > 0 && quizId && (
                <Button 
                  onClick={handleDeleteAllQuestions} 
                  disabled={deletingAllQuestions || saving}
                  variant="outline"
                  className="flex items-center gap-2 text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300"
                >
                  <Eraser className="h-4 w-4" />
                  {deletingAllQuestions ? 'Deleting...' : `Delete All ${questions.length} Questions`}
                </Button>
              )}
              {questions.length > 0 && (
                <Button 
                  onClick={handleSaveQuiz} 
                  disabled={saving || deletingAllQuestions}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : quizId ? 'Update Quiz' : 'Save Quiz'}
                </Button>
              )}
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          {/* Main Content */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Question Form Section */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  {editingQuestion ? 'Edit Question' : 'Add New Question'}
                </CardTitle>
                <CardDescription>
                  {editingQuestion 
                    ? 'Modify the selected question details below'
                    : 'Create a new quiz question with multiple choice answers'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QuestionForm
                  onSubmit={
                    editingQuestion ? handleEditQuestion : handleAddQuestion
                  }
                  initialQuestion={editingQuestion}
                  key={editingQuestion?.id}
                />
              </CardContent>
            </Card>

            {/* Questions List Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Quiz Questions ({questions.length})</span>
                  {questions.length > 0 && (
                    <Badge variant="secondary">
                      {questions.length} question{questions.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Manage your quiz questions. Click edit to modify or delete to remove.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {questions.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No questions yet</p>
                    <p className="text-sm">Start by adding your first quiz question using the form on the left.</p>
                  </div>
                ) : (
                  <QuestionList
                    questions={questions}
                    onEdit={startEditQuestion}
                    onDelete={handleDeleteQuestion}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function QuizPageLoading() {
  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading quiz page...</p>
      </div>
    </div>
  )
}

export default function QuizPage({ params }: QuizPageProps) {
  return (
    <Suspense fallback={<QuizPageLoading />}>
      <QuizPageContent params={params} />
    </Suspense>
  )
}
