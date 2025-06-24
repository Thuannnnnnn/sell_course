'use client';

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import QuestionForm from '../../components/quiz/QuestionForm'
import QuestionList from '../../components/quiz/QuestionList'
import { BookOpen, Save, AlertCircle } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { QuizFormData } from '../types/quiz'
import { useQuiz } from '../../hooks/useQuiz'

export default function QuizPage() {
  const searchParams = useSearchParams()
  const courseId = searchParams.get('courseId')
  const lessonId = searchParams.get('lessonId')
  const contentId = searchParams.get('contentId')
  const quizId = searchParams.get('quizId')

  const [editingQuestion, setEditingQuestion] = useState<QuizFormData | null>(null)
  
  const {
    questions,
    loading,
    saving,
    error,
    success,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    loadQuiz,
    saveQuiz
  } = useQuiz({ courseId: courseId || undefined, lessonId: lessonId || undefined, contentId: contentId || undefined, quizId: quizId || undefined })
  // Load existing quiz data
  useEffect(() => {
    if (courseId && lessonId && contentId && quizId) {
      loadQuiz()
    }
  }, [courseId, lessonId, contentId, quizId, loadQuiz])

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

  const handleSaveQuiz = () => {
    saveQuiz()
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
      <div className="container max-w-6xl px-4 py-12">
        <div className="flex flex-col space-y-8">
          <div className="flex items-center justify-between border-b pb-8">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">
                  Quiz Manager
                </h1>
                <p className="text-lg text-muted-foreground mt-1">
                  Create and manage your quiz questions with ease
                </p>
              </div>
            </div>
            {questions.length > 0 && (
              <Button 
                onClick={handleSaveQuiz} 
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : quizId ? 'Update Quiz' : 'Save Quiz'}
              </Button>
            )}
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
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="relative">
              <div className="sticky top-4 space-y-6">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-1 bg-primary rounded-full" />
                  <h2 className="text-2xl font-semibold">
                    {editingQuestion ? 'Edit Question' : 'Add New Question'}
                  </h2>
                </div>
                <QuestionForm
                  onSubmit={
                    editingQuestion ? handleEditQuestion : handleAddQuestion
                  }
                  initialQuestion={editingQuestion}
                  key={editingQuestion?.id}
                />
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="h-8 w-1 bg-primary rounded-full" />
                <h2 className="text-2xl font-semibold">Questions</h2>
              </div>
              <QuestionList
                questions={questions}
                onEdit={startEditQuestion}
                onDelete={handleDeleteQuestion}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
