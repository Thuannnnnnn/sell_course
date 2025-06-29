import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Checkbox } from '../ui/checkbox'
import { Switch } from '../ui/switch'
import { BookOpen, Settings, AlertCircle } from 'lucide-react'
import { AvailableQuiz, ExamCreationConfig } from '../../app/types/exam'

interface CreateExamFromQuizzesFormProps {
  availableQuizzes: AvailableQuiz[]
  onSubmit: (config: ExamCreationConfig) => void
  loading?: boolean
}

export function CreateExamFromQuizzesForm({ 
  availableQuizzes, 
  onSubmit, 
  loading 
}: CreateExamFromQuizzesFormProps) {
  const [config, setConfig] = useState<ExamCreationConfig>({
    questionsPerQuiz: 5,
    totalQuestions: undefined,
    includeAllQuizzes: true,
    specificQuizIds: []
  })
  const [selectedQuizzes, setSelectedQuizzes] = useState<string[]>([])
  const [error, setError] = useState('')

  const totalAvailableQuestions = availableQuizzes.reduce(
    (sum, quiz) => sum + quiz.questionCount, 0
  )

  const selectedQuizzesData = availableQuizzes.filter(
    quiz => selectedQuizzes.includes(quiz.quizzId)
  )
  
  const selectedQuestionsCount = selectedQuizzesData.reduce(
    (sum, quiz) => sum + quiz.questionCount, 0
  )

  const estimatedExamQuestions = config.includeAllQuizzes 
    ? Math.min(
        config.questionsPerQuiz ? availableQuizzes.length * config.questionsPerQuiz : totalAvailableQuestions,
        config.totalQuestions || totalAvailableQuestions
      )
    : Math.min(
        config.questionsPerQuiz ? selectedQuizzes.length * config.questionsPerQuiz : selectedQuestionsCount,
        config.totalQuestions || selectedQuestionsCount
      )

  const handleQuizToggle = (quizId: string) => {
    setSelectedQuizzes(prev => 
      prev.includes(quizId) 
        ? prev.filter(id => id !== quizId)
        : [...prev, quizId]
    )
  }

  const handleSubmit = () => {
    setError('')

    if (availableQuizzes.length === 0) {
      setError('No quizzes available to create exam from')
      return
    }

    if (!config.includeAllQuizzes && selectedQuizzes.length === 0) {
      setError('Please select at least one quiz or enable "Include All Quizzes"')
      return
    }

    if (config.questionsPerQuiz && config.questionsPerQuiz < 1) {
      setError('Questions per quiz must be at least 1')
      return
    }

    if (config.totalQuestions && config.totalQuestions < 1) {
      setError('Total questions must be at least 1')
      return
    }

    const examConfig: ExamCreationConfig = {
      ...config,
      specificQuizIds: config.includeAllQuizzes ? undefined : selectedQuizzes
    }

    onSubmit(examConfig)
  }

  if (availableQuizzes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg">
        <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Quizzes Available</h3>
        <p className="text-muted-foreground text-center">
          There are no quizzes in this course to create an exam from.
          <br />
          Please create some quizzes first.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 p-3 rounded-md">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Configuration Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Exam Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="questionsPerQuiz">Questions per Quiz</Label>
              <Input
                id="questionsPerQuiz"
                type="number"
                min="1"
                max="50"
                value={config.questionsPerQuiz || ''}
                onChange={(e) => setConfig(prev => ({ 
                  ...prev, 
                  questionsPerQuiz: parseInt(e.target.value) || undefined 
                }))}
                placeholder="e.g., 5"
              />
              <p className="text-xs text-muted-foreground">
                Maximum questions to take from each quiz
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalQuestions">Total Questions Limit (Optional)</Label>
              <Input
                id="totalQuestions"
                type="number"
                min="1"
                max="200"
                value={config.totalQuestions || ''}
                onChange={(e) => setConfig(prev => ({ 
                  ...prev, 
                  totalQuestions: parseInt(e.target.value) || undefined 
                }))}
                placeholder="e.g., 50"
              />
              <p className="text-xs text-muted-foreground">
                Maximum total questions in the exam
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="includeAll" className="font-medium">
                Include All Quizzes
              </Label>
              <p className="text-sm text-muted-foreground">
                Automatically include questions from all available quizzes
              </p>
            </div>
            <Switch
              id="includeAll"
              checked={config.includeAllQuizzes}
              onCheckedChange={(checked: boolean) => setConfig(prev => ({ 
                ...prev, 
                includeAllQuizzes: checked 
              }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quiz Selection */}
      {!config.includeAllQuizzes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Select Quizzes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {availableQuizzes.map((quiz) => (
                <div
                  key={quiz.quizzId}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={quiz.quizzId}
                      checked={selectedQuizzes.includes(quiz.quizzId)}
                      onCheckedChange={() => handleQuizToggle(quiz.quizzId)}
                    />
                    <div>
                      <Label 
                        htmlFor={quiz.quizzId} 
                        className="font-medium cursor-pointer"
                      >
                        Quiz {quiz.quizzId.slice(-6)}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Course: {quiz.courseId.slice(-6)} • Lesson: {quiz.lessonId.slice(-6)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {quiz.questionCount} questions
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Exam Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-2xl font-bold text-primary">
                {config.includeAllQuizzes ? availableQuizzes.length : selectedQuizzes.length}
              </p>
              <p className="text-sm text-muted-foreground">
                {config.includeAllQuizzes ? 'Total' : 'Selected'} Quizzes
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-blue-600">
                {config.includeAllQuizzes ? totalAvailableQuestions : selectedQuestionsCount}
              </p>
              <p className="text-sm text-muted-foreground">Available Questions</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-green-600">
                ~{estimatedExamQuestions}
              </p>
              <p className="text-sm text-muted-foreground">Estimated Exam Questions</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-orange-600">
                {config.questionsPerQuiz || 'All'}
              </p>
              <p className="text-sm text-muted-foreground">Per Quiz</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={loading || (!config.includeAllQuizzes && selectedQuizzes.length === 0)}
          className="min-w-[140px]"
        >
          {loading ? 'Creating Exam...' : 'Create Exam from Quizzes'}
        </Button>
      </div>
    </div>
  )
}