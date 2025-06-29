import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'
import { Plus, Trash2, Check, X } from 'lucide-react'
import { CreateExamQuestionDto } from '../../app/types/exam'

interface ExamFormProps {
  onSubmit: (questions: CreateExamQuestionDto[]) => void
  loading?: boolean
}

interface QuestionForm {
  question: string
  difficulty: 'easy' | 'medium' | 'hard'
  weight: number
  answers: AnswerForm[]
}

interface AnswerForm {
  answer: string
  isCorrect: boolean
}

export function ExamForm({ onSubmit, loading }: ExamFormProps) {
  const [questions, setQuestions] = useState<QuestionForm[]>([
    {
      question: '',
      difficulty: 'medium',
      weight: 1,
      answers: [
        { answer: '', isCorrect: false },
        { answer: '', isCorrect: false }
      ]
    }
  ])
  const [error, setError] = useState('')

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        difficulty: 'medium',
        weight: 1,
        answers: [
          { answer: '', isCorrect: false },
          { answer: '', isCorrect: false }
        ]
      }
    ])
  }

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index))
    }
  }

  const updateQuestion = (index: number, field: keyof QuestionForm, value: QuestionForm[keyof QuestionForm]) => {
    const updated = [...questions]
    updated[index] = { ...updated[index], [field]: value }
    setQuestions(updated)
  }

  const addAnswer = (questionIndex: number) => {
    const updated = [...questions]
    updated[questionIndex].answers.push({ answer: '', isCorrect: false })
    setQuestions(updated)
  }

  const removeAnswer = (questionIndex: number, answerIndex: number) => {
    const updated = [...questions]
    if (updated[questionIndex].answers.length > 2) {
      updated[questionIndex].answers = updated[questionIndex].answers.filter((_, i) => i !== answerIndex)
      setQuestions(updated)
    }
  }

  const updateAnswer = (questionIndex: number, answerIndex: number, field: keyof AnswerForm, value: AnswerForm[keyof AnswerForm]) => {
    const updated = [...questions]
    updated[questionIndex].answers[answerIndex] = {
      ...updated[questionIndex].answers[answerIndex],
      [field]: value
    }
    setQuestions(updated)
  }

  const toggleCorrectAnswer = (questionIndex: number, answerIndex: number) => {
    const updated = [...questions]
    updated[questionIndex].answers[answerIndex].isCorrect = !updated[questionIndex].answers[answerIndex].isCorrect
    setQuestions(updated)
  }

  const validateForm = (): boolean => {
    setError('')

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i]
      
      if (!question.question.trim()) {
        setError(`Question ${i + 1}: Question text is required`)
        return false
      }

      if (question.answers.length < 2) {
        setError(`Question ${i + 1}: At least 2 answers are required`)
        return false
      }

      const hasCorrectAnswer = question.answers.some(a => a.isCorrect && a.answer.trim())
      if (!hasCorrectAnswer) {
        setError(`Question ${i + 1}: At least one correct answer is required`)
        return false
      }

      const validAnswers = question.answers.filter(a => a.answer.trim())
      if (validAnswers.length < 2) {
        setError(`Question ${i + 1}: At least 2 valid answers are required`)
        return false
      }
    }

    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const examQuestions: CreateExamQuestionDto[] = questions.map(q => ({
      question: q.question.trim(),
      difficulty: q.difficulty,
      weight: q.weight,
      answers: q.answers
        .filter(a => a.answer.trim())
        .map(a => ({
          answer: a.answer.trim(),
          isCorrect: a.isCorrect
        }))
    }))

    onSubmit(examQuestions)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 p-3 rounded-md">
          <X className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="space-y-4">
        {questions.map((question, questionIndex) => (
          <Card key={questionIndex} className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Question {questionIndex + 1}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={getDifficultyColor(question.difficulty)}>
                    {question.difficulty}
                  </Badge>
                  <Badge variant="outline">
                    {question.weight} pts
                  </Badge>
                  {questions.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(questionIndex)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Question Text */}
              <div className="space-y-2">
                <Label>Question Text</Label>
                <Textarea
                  value={question.question}
                  onChange={(e) => updateQuestion(questionIndex, 'question', e.target.value)}
                  placeholder="Enter your question..."
                  className="min-h-[80px]"
                />
              </div>

              {/* Question Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select
                    value={question.difficulty}
                    onValueChange={(value) => updateQuestion(questionIndex, 'difficulty', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Weight (Points)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={question.weight}
                    onChange={(e) => updateQuestion(questionIndex, 'weight', parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>

              {/* Answers */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Answers</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addAnswer(questionIndex)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Answer
                  </Button>
                </div>

                <div className="space-y-2">
                  {question.answers.map((answer, answerIndex) => (
                    <div key={answerIndex} className="flex items-center gap-2 p-3 border rounded-lg">
                      <Checkbox
                        id={`q${questionIndex}-a${answerIndex}`}
                        checked={answer.isCorrect}
                        onCheckedChange={() => toggleCorrectAnswer(questionIndex, answerIndex)}
                      />
                      <Input
                        value={answer.answer}
                        onChange={(e) => updateAnswer(questionIndex, answerIndex, 'answer', e.target.value)}
                        placeholder={`Answer ${answerIndex + 1}...`}
                        className="flex-1"
                      />
                      <div className="flex items-center gap-1">
                        {answer.isCorrect && (
                          <Check className="h-4 w-4 text-green-500" />
                        )}
                        {question.answers.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAnswer(questionIndex, answerIndex)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={addQuestion}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
        
        <Button
          type="submit"
          disabled={loading}
          className="min-w-[120px]"
        >
          {loading ? 'Creating...' : 'Create Exam'}
        </Button>
      </div>
    </form>
  )
}