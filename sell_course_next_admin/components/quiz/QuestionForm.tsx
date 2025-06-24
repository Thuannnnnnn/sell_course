'use client';
import React, { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent } from '../ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Label } from '../ui/label'
import { QuizFormData } from '../../app/types/quiz'
import { Check } from 'lucide-react'
interface QuestionFormProps {
  onSubmit: (question: QuizFormData) => void
  initialQuestion?: QuizFormData | null
}
export default function QuestionForm({ onSubmit, initialQuestion }: QuestionFormProps) {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', '', '', ''])
  const [correctAnswer, setCorrectAnswer] = useState(0)
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [weight, setWeight] = useState(1)
  const [error, setError] = useState('')
  useEffect(() => {
    if (initialQuestion) {
      setQuestion(initialQuestion.question)
      setOptions(initialQuestion.options)
      setCorrectAnswer(initialQuestion.correctAnswer)
      setDifficulty(initialQuestion.difficulty || 'medium')
      setWeight(initialQuestion.weight || 1)
    }
  }, [initialQuestion])
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!question.trim() || options.some((opt) => !opt.trim())) {
      setError('Please fill in all fields')
      return
    }
    const newQuestion: QuizFormData = {
      id: initialQuestion?.id || Math.random().toString(36).substr(2, 9),
      question,
      options,
      correctAnswer,
      difficulty,
      weight,
    }
    onSubmit(newQuestion)
    if (!initialQuestion) {
      setQuestion('')
      setOptions(['', '', '', ''])
      setCorrectAnswer(0)
      setDifficulty('medium')
      setWeight(1)
    }
  }
  return (
    <Card className="border-2">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 p-3 rounded-md">
              <div className="h-4 w-4" />
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Question Text</Label>
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your question here..."
              className="h-12"
              required
            />
          </div>

          {/* Question Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Difficulty Level</Label>
              <Select value={difficulty} onValueChange={(value: 'easy' | 'medium' | 'hard') => setDifficulty(value)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Weight (Points)</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={weight}
                onChange={(e) => setWeight(parseInt(e.target.value) || 1)}
                className="h-12"
              />
            </div>
          </div>
          <div className="space-y-3">
            <Label className="text-sm font-medium">Answer Options</Label>
            {options.map((option, index) => (
              <div key={index} className="flex gap-3">
                <Input
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...options]
                    newOptions[index] = e.target.value
                    setOptions(newOptions)
                  }}
                  placeholder={`Option ${index + 1}`}
                  className="h-12"
                  required
                />
                <Button
                  type="button"
                  variant={correctAnswer === index ? 'default' : 'outline'}
                  className="min-w-[100px]"
                  onClick={() => setCorrectAnswer(index)}
                >
                  {correctAnswer === index ? (
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      Correct
                    </div>
                  ) : (
                    'Mark'
                  )}
                </Button>
              </div>
            ))}
          </div>



          <Button type="submit" className="w-full h-12 text-base">
            {initialQuestion ? 'Update Question' : 'Add Question'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
