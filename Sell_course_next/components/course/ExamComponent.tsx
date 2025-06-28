import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { Label } from '../ui/label'
import { 
  FileText, 
  Lock, 
  AlertTriangle, 
  CheckCircle, 
  AlertCircle,
  GraduationCap,
  ArrowLeft,
  ArrowRight
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { ExamQuestion, ExamAnswer } from '../../app/types/exam/result-exam'
import { resultExamApi } from '../../app/api/courses/exam/resultexam'
import { useSession } from 'next-auth/react'

interface ExamComponentProps {
  exam: {
    examId: string
    courseId: string
    title: string
    questions: ExamQuestion[]
    totalQuestions: number
    isLocked: boolean
  }
  userExamResults?: {
    score: number
  } | null
  onExamComplete?: (score: number) => void
}

interface UserAnswer {
  questionId: string
  answerId: string
  selectedAnswer: ExamAnswer
}

type ExamState = 'overview' | 'taking' | 'completed'

export function ExamComponent({ exam, userExamResults, onExamComplete }: ExamComponentProps) {
  const { data: session } = useSession()
  const [examState, setExamState] = useState<ExamState>('overview')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([])
  const [selectedAnswerId, setSelectedAnswerId] = useState<string>('')
  const [examScore, setExamScore] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentQuestion = exam.questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === exam.questions.length - 1

  const handleStartExam = () => {
    if (exam.isLocked) return
    setExamState('taking')
    setCurrentQuestionIndex(0)
    setUserAnswers([])
    setSelectedAnswerId('')
    setExamScore(0)
    setError(null)
  }

  const handleAnswerSelect = (answerId: string) => {
    if (!currentQuestion) return
    
    const selectedAnswer = currentQuestion.answers.find(
      answer => answer.answerId === answerId
    )
    
    if (!selectedAnswer) return

    setSelectedAnswerId(answerId)
    
    // Update or add answer
    const existingAnswerIndex = userAnswers.findIndex(
      answer => answer.questionId === currentQuestion.questionId
    )
    
    const newAnswer: UserAnswer = {
      questionId: currentQuestion.questionId,
      answerId: answerId,
      selectedAnswer: selectedAnswer
    }
    
    if (existingAnswerIndex >= 0) {
      const updatedAnswers = [...userAnswers]
      updatedAnswers[existingAnswerIndex] = newAnswer
      setUserAnswers(updatedAnswers)
    } else {
      setUserAnswers([...userAnswers, newAnswer])
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      
      // Set selected answer for next question if already answered
      const nextQuestion = exam.questions[currentQuestionIndex + 1]
      const existingAnswer = userAnswers.find(
        answer => answer.questionId === nextQuestion.questionId
      )
      setSelectedAnswerId(existingAnswer?.answerId || '')
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      
      // Set selected answer for previous question
      const prevQuestion = exam.questions[currentQuestionIndex - 1]
      const existingAnswer = userAnswers.find(
        answer => answer.questionId === prevQuestion.questionId
      )
      setSelectedAnswerId(existingAnswer?.answerId || '')
    }
  }

  const calculateScore = () => {
    let correctAnswers = 0
    userAnswers.forEach(userAnswer => {
      if (userAnswer.selectedAnswer.isCorrect) {
        correctAnswers++
      }
    })
    return Math.round((correctAnswers / exam.questions.length) * 100)
  }

  const handleSubmitExam = async () => {
    if (userAnswers.length !== exam.questions.length) {
      setError('Please answer all questions before submitting.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const score = calculateScore()
      setExamScore(score)

      // Submit to API if user is authenticated
      if (session?.accessToken) {
        const submissionData = {
          examId: exam.examId,
          courseId: exam.courseId,
          answers: userAnswers.map(answer => ({
            questionId: answer.questionId,
            answerId: answer.answerId
          }))
        }

        await resultExamApi.submitExam(submissionData, session.accessToken)
      }

      setExamState('completed')
      onExamComplete?.(score)
    } catch (err) {
      setError('Failed to submit exam. Please try again.')
      console.error('Error submitting exam:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRetakeExam = () => {
    setExamState('overview')
    setCurrentQuestionIndex(0)
    setUserAnswers([])
    setSelectedAnswerId('')
    setExamScore(0)
    setError(null)
  }

  // Set selected answer when question changes
  useEffect(() => {
    if (currentQuestion) {
      const existingAnswer = userAnswers.find(
        answer => answer.questionId === currentQuestion.questionId
      )
      setSelectedAnswerId(existingAnswer?.answerId || '')
    }
  }, [currentQuestionIndex, currentQuestion, userAnswers])

  if (examState === 'overview') {
    return (
      <Card className={cn(
        'overflow-hidden transition-all max-w-md mx-auto',
        exam.isLocked ? 'opacity-80' : 'hover:shadow-md',
      )}>
        <CardHeader className="bg-primary/5 pb-4">
          <CardTitle className="flex items-center gap-3">
            <GraduationCap className="h-6 w-6 text-primary" />
            <div>
              <h3 className="text-lg font-semibold">{exam.title}</h3>
              <p className="text-sm text-muted-foreground font-normal">
                Test your knowledge with this comprehensive exam
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary p-2 rounded-full">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Questions</div>
                  <div className="font-medium">{exam.totalQuestions} questions</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary p-2 rounded-full">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div className="font-medium">
                    {userExamResults ? `Score: ${userExamResults.score}%` : 'Not taken'}
                  </div>
                </div>
              </div>
            </div>

            {exam.isLocked && (
              <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <p className="text-sm text-orange-800">
                  Please sign in to take this exam
                </p>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter>
          <Button
            className="w-full"
            onClick={handleStartExam}
            disabled={exam.isLocked}
            size="lg"
          >
            {exam.isLocked ? (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Locked
              </>
            ) : userExamResults ? (
              'Retake Exam'
            ) : (
              'Start Exam'
            )}
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (examState === 'taking') {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="overflow-hidden">
          <CardHeader className="bg-primary/5">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg">{exam.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {exam.questions.length}
                </p>
              </div>
              <div className="text-sm font-medium">
                Answered: {userAnswers.length}/{exam.questions.length}
              </div>
            </div>
            <Progress 
              value={((currentQuestionIndex + 1) / exam.questions.length) * 100} 
              className="mt-4" 
            />
          </CardHeader>

          <CardContent className="pt-6">
            {currentQuestion && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    {currentQuestion.question}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      currentQuestion.difficulty === 'easy' && "bg-green-100 text-green-800",
                      currentQuestion.difficulty === 'medium' && "bg-yellow-100 text-yellow-800",
                      currentQuestion.difficulty === 'hard' && "bg-red-100 text-red-800"
                    )}>
                      {currentQuestion.difficulty}
                    </span>
                    <span>Weight: {currentQuestion.weight}</span>
                  </div>
                </div>

                <RadioGroup
                  value={selectedAnswerId}
                  onValueChange={handleAnswerSelect}
                >
                  {currentQuestion.answers.map((answer, index) => (
                    <div
                      key={answer.answerId}
                      className="flex items-center space-x-3 border p-4 rounded-lg hover:bg-accent cursor-pointer"
                    >
                      <RadioGroupItem
                        value={answer.answerId}
                        id={`answer-${index}`}
                      />
                      <Label
                        htmlFor={`answer-${index}`}
                        className="flex-1 cursor-pointer"
                      >
                        {answer.answer}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2">
              {isLastQuestion ? (
                <Button
                  onClick={handleSubmitExam}
                  disabled={userAnswers.length !== exam.questions.length || isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Exam'}
                </Button>
              ) : (
                <Button
                  onClick={handleNextQuestion}
                  disabled={!selectedAnswerId}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (examState === 'completed') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Score Summary */}
        <Card className="text-center">
          <CardContent className="pt-8 pb-6">
            <div className="flex justify-center mb-6">
              <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-4xl font-bold text-primary">
                  {examScore}%
                </span>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Exam Completed!</h2>
            <p className="text-lg mb-4">
              You scored {userAnswers.filter(a => a.selectedAnswer.isCorrect).length} out of {exam.questions.length} questions
            </p>
            {examScore >= 70 ? (
              <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Congratulations! You passed!</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-orange-600 mb-4">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Keep studying and try again!</span>
              </div>
            )}
            <Button onClick={handleRetakeExam} variant="outline">
              Retake Exam
            </Button>
          </CardContent>
        </Card>

        {/* Detailed Results */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {exam.questions.map((question, index) => {
                const userAnswer = userAnswers.find(a => a.questionId === question.questionId)
                const isCorrect = userAnswer?.selectedAnswer.isCorrect || false

                return (
                  <div key={question.questionId} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                        isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      )}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium mb-2">{question.question}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            question.difficulty === 'easy' && "bg-green-100 text-green-800",
                            question.difficulty === 'medium' && "bg-yellow-100 text-yellow-800",
                            question.difficulty === 'hard' && "bg-red-100 text-red-800"
                          )}>
                            {question.difficulty}
                          </span>
                          {isCorrect ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 ml-11">
                      {question.answers.map((answer) => {
                        const isSelected = userAnswer?.answerId === answer.answerId
                        const isCorrectAnswer = answer.isCorrect
                        
                        return (
                          <div
                            key={answer.answerId}
                            className={cn(
                              "p-3 rounded-lg border-2 transition-colors",
                              isCorrectAnswer && "border-green-500 bg-green-50",
                              isSelected && !isCorrectAnswer && "border-red-500 bg-red-50",
                              !isSelected && !isCorrectAnswer && "border-gray-200 bg-gray-50"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                                isCorrectAnswer && "border-green-500 bg-green-500",
                                isSelected && !isCorrectAnswer && "border-red-500 bg-red-500",
                                !isSelected && !isCorrectAnswer && "border-gray-300"
                              )}>
                                {(isSelected || isCorrectAnswer) && (
                                  <div className="w-2 h-2 rounded-full bg-white" />
                                )}
                              </div>
                              <span className="flex-1">{answer.answer}</span>
                              {isCorrectAnswer && (
                                <div className="flex items-center gap-1 text-green-700">
                                  <CheckCircle className="h-4 w-4" />
                                  <span className="text-sm font-medium">Correct</span>
                                </div>
                              )}
                              {isSelected && !isCorrectAnswer && (
                                <div className="flex items-center gap-1 text-red-700">
                                  <AlertCircle className="h-4 w-4" />
                                  <span className="text-sm font-medium">Your answer</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}