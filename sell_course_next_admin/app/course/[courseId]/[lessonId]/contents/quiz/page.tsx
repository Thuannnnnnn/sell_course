'use client';

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import QuestionForm from '../../../../../../components/quiz/QuestionForm'
import QuestionList from '../../../../../../components/quiz/QuestionList'
import { BookOpen, Save, AlertCircle, ArrowLeft, Plus, Eraser, ArrowUp, Sparkles, Loader2 } from 'lucide-react'
import { Button } from '../../../../../../components/ui/button'
import { Alert, AlertDescription } from '../../../../../../components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../../components/ui/card'
import { Badge } from '../../../../../../components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../../../../components/ui/dialog'
import { Input } from '../../../../../../components/ui/input'
import { Label } from '../../../../../../components/ui/label'
import { QuizFormData } from '../../../../../types/quiz'
import { useQuiz } from '../../../../../../hooks/useQuiz'
import { quizApi } from '../../../../../api/quiz/quiz'
import Link from 'next/link'

// AI Quiz Response interfaces
interface AIQuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  difficulty: 'easy' | 'medium' | 'hard'
  weight: number
}

interface AIQuizResponse {
  success: boolean
  quizzes: AIQuizQuestion[]
  error?: string
}

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
  const aiQuestions = searchParams.get('aiQuestions')

  // All hooks must be called before any early returns
  const [editingQuestion, setEditingQuestion] = useState<QuizFormData | null>(null)
  const [deletingAllQuestions, setDeletingAllQuestions] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  
  // AI Generation states
  const [aiDialogOpen, setAiDialogOpen] = useState(false)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiQuizCount, setAiQuizCount] = useState(5)
  
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

  // Load AI generated questions
  useEffect(() => {
    if (aiQuestions && !quizId) {
      try {
        const parsedQuestions: AIQuizQuestion[] = JSON.parse(decodeURIComponent(aiQuestions));
        // Add all AI questions to the quiz
        parsedQuestions.forEach((question: AIQuizQuestion) => {
          const formattedQuestion: QuizFormData = {
            id: question.id,
            question: question.question,
            options: question.options,
            correctAnswer: question.correctAnswer,
            difficulty: question.difficulty,
            weight: question.weight,
          };
          addQuestion(formattedQuestion);
        });
        
        // Remove aiQuestions from URL to clean it up
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('aiQuestions');
        router.replace(newUrl.pathname + newUrl.search);
        
      } catch (error) {
        console.error('Failed to parse AI questions:', error);
      }
    }
  }, [aiQuestions, quizId, addQuestion, router])

  // Handle scroll to show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const handleGenerateAIQuiz = async () => {
    if (!contentId) {
      alert('Content ID is required')
      return
    }

    setAiGenerating(true)

    try {
      const response = await fetch('http://localhost:8000/generate-quiz-from-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content_id: contentId,
          quiz_count: aiQuizCount,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate AI quiz')
      }

      const result: AIQuizResponse = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'AI quiz generation failed')
      }

      // Add all AI questions to current quiz
      result.quizzes.forEach((question: AIQuizQuestion) => {
        const formattedQuestion: QuizFormData = {
          id: question.id,
          question: question.question,
          options: question.options,
          correctAnswer: question.correctAnswer,
          difficulty: question.difficulty,
          weight: question.weight,
        }
        addQuestion(formattedQuestion)
      })
      
      // Close dialog and reset form
      setAiDialogOpen(false)
      setAiQuizCount(5)
      
    } catch (err) {
      const error = err as Error
      alert(`AI Generation failed: ${error.message}`)
    } finally {
      setAiGenerating(false)
    }
  }

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
              {/* AI Generate Quiz Button */}
              <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-blue-100"
                    disabled={saving || deletingAllQuestions || aiGenerating}
                  >
                    <Sparkles className="h-4 w-4" />
                    Generate AI Quiz
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-sm">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      Generate AI Quiz
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground">
                        AI will automatically read content documents and video scripts to generate quiz questions
                      </p>
                      <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Easy (1-4 pts)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span>Medium (5-7 pts)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span>Hard (8-10 pts)</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="count" className="text-center block">Number of Questions</Label>
                      <Input
                        id="count"
                        type="number"
                        min="1"
                        max="20"
                        value={aiQuizCount}
                        onChange={(e) => setAiQuizCount(parseInt(e.target.value) || 5)}
                        className="text-center text-lg font-semibold"
                      />
                    </div>
                    
                    <Button 
                      onClick={handleGenerateAIQuiz} 
                      disabled={aiGenerating}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      size="lg"
                    >
                      {aiGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          AI is generating questions...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate {aiQuizCount} Questions
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

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
                  style={{
            backgroundColor: "#513deb",
            color: "white",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#4f46e5";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#513deb";
          }}
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
          <div className="grid gap-6 xl:grid-cols-5 lg:grid-cols-1">
            {/* Question Form Section - Sticky on larger screens */}
            <div className="xl:col-span-2 lg:col-span-1 order-1 xl:order-1">
              <div className="space-y-4">
                {/* Form Header Card */}
                <Card className="bg-gradient-to-r from-[#513deb]/5 to-[#4f46e5]/5 border-[#513deb]/20">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 bg-[#513deb]/10 rounded-lg">
                        <Plus className="h-5 w-5 text-[#513deb]" />
                      </div>
                      {editingQuestion ? 'Edit Question' : 'Create New Question'}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {editingQuestion 
                        ? 'Modify the selected question details below'
                        : 'Design engaging quiz questions with multiple choice answers'
                      }
                    </CardDescription>
                  </CardHeader>
                </Card>

                {/* Question Form */}
                <QuestionForm
                  onSubmit={
                    editingQuestion ? handleEditQuestion : handleAddQuestion
                  }
                  initialQuestion={editingQuestion}
                  key={editingQuestion?.id}
                />

                {/* Quick Stats Card */}
                {questions.length > 0 && (
                  <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-green-600">{questions.length}</div>
                          <div className="text-xs text-gray-600">Questions</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            {questions.reduce((sum, q) => sum + (q.weight || 1), 0)}
                          </div>
                          <div className="text-xs text-gray-600">Total Points</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-purple-600">
                            {Math.round(questions.reduce((sum, q) => sum + (q.weight || 1), 0) / questions.length * 10) / 10}
                          </div>
                          <div className="text-xs text-gray-600">Avg Points</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Questions List Section */}
            <div className="xl:col-span-3 lg:col-span-1 order-2 xl:order-2">
              <Card className="h-fit">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <CardTitle className="flex items-center justify-between text-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-200 rounded-lg">
                        <BookOpen className="h-5 w-5 text-gray-700" />
                      </div>
                      <span>Quiz Questions</span>
                    </div>
                    {questions.length > 0 && (
                      <Badge variant="secondary" className="text-sm px-3 py-1">
                        {questions.length} question{questions.length !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-base">
                    Manage your quiz questions. Click edit to modify or delete to remove.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {questions.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="max-w-md mx-auto">
                        <div className="relative mb-6">
                          <div className="absolute inset-0 bg-gradient-to-r from-[#513deb]/20 to-[#4f46e5]/20 rounded-full blur-xl"></div>
                          <BookOpen className="relative h-16 w-16 mx-auto text-[#513deb] opacity-60" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">No questions yet</h3>
                        <p className="text-gray-600 mb-6">
                          Start building your quiz by adding your first question using the form on the left.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                          <div className="h-1 w-8 bg-gradient-to-r from-[#513deb] to-[#4f46e5] rounded-full"></div>
                          <span>Get started now</span>
                          <div className="h-1 w-8 bg-gradient-to-r from-[#4f46e5] to-[#513deb] rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="max-h-[800px] overflow-y-auto custom-scrollbar-enhanced">
                      <QuestionList
                        questions={questions}
                        onEdit={startEditQuestion}
                        onDelete={handleDeleteQuestion}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Floating Scroll to Top Button */}
          {showScrollTop && (
            <div className="fixed bottom-8 right-8 z-50">
              <Button
                onClick={scrollToTop}
                size="icon"
                className="h-12 w-12 rounded-full bg-gradient-to-r from-[#513deb] to-[#4f46e5] hover:from-[#4f46e5] hover:to-[#4338ca] shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
              >
                <ArrowUp className="h-5 w-5" />
              </Button>
            </div>
          )}
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
