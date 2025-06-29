import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Check } from 'lucide-react'

// Form-specific Question type
interface FormQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
}

interface QuestionFormProps {
  onSubmit: (question: FormQuestion) => void
  initialQuestion?: FormQuestion | null
}
export default function QuestionForm({ onSubmit, initialQuestion }: QuestionFormProps) {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', '', '', ''])
  const [correctAnswer, setCorrectAnswer] = useState(0)
  const [error, setError] = useState('')
  useEffect(() => {
    if (initialQuestion) {
      setQuestion(initialQuestion.question)
      setOptions(initialQuestion.options)
      setCorrectAnswer(initialQuestion.correctAnswer)
    }
  }, [initialQuestion])
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!question.trim() || options.some((opt) => !opt.trim())) {
      setError('Please fill in all fields')
      return
    }
    const newQuestion: FormQuestion = {
      id: initialQuestion?.id || Math.random().toString(36).substr(2, 9),
      question,
      options,
      correctAnswer,
    }
    onSubmit(newQuestion)
    if (!initialQuestion) {
      setQuestion('')
      setOptions(['', '', '', ''])
      setCorrectAnswer(0)
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
            <label className="text-sm font-medium">Question Text</label>
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your question here..."
              className="h-12"
              required
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium">Answer Options</label>
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
