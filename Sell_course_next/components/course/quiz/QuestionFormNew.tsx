import React, { useEffect, useState } from 'react'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Card, CardContent } from '../../ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group'
import { Label } from '../../ui/label'
import { Question, Answer } from '../../../app/types/Course/Lesson/content/quizz'
import { Check, Plus, Trash2 } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

interface QuestionFormProps {
  onSubmit: (question: Question) => void
  initialQuestion?: Question | null
}

interface AnswerInput {
  id: string;
  text: string;
  isCorrect: boolean;
}

export default function QuestionFormNew({ onSubmit, initialQuestion }: QuestionFormProps) {
  const [questionText, setQuestionText] = useState('')
  const [answerInputs, setAnswerInputs] = useState<AnswerInput[]>([
    { id: uuidv4(), text: '', isCorrect: true },
    { id: uuidv4(), text: '', isCorrect: false },
    { id: uuidv4(), text: '', isCorrect: false },
    { id: uuidv4(), text: '', isCorrect: false }
  ])
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [weight, setWeight] = useState(1)
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialQuestion) {
      setQuestionText(initialQuestion.question)
      setDifficulty(initialQuestion.difficulty)
      setWeight(initialQuestion.weight)
      const inputs: AnswerInput[] = initialQuestion.answers.map(answer => ({
        id: answer.answerId,
        text: answer.answer,
        isCorrect: answer.isCorrect
      }))
      // Ensure we have at least 2 inputs
      while (inputs.length < 2) {
        inputs.push({ id: uuidv4(), text: '', isCorrect: false })
      }
      setAnswerInputs(inputs)
    }
  }, [initialQuestion])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!questionText.trim()) {
      setError('Please enter a question')
      return
    }

    const validAnswers = answerInputs.filter(input => input.text.trim())
    if (validAnswers.length < 2) {
      setError('Please provide at least 2 answers')
      return
    }

    const correctAnswers = validAnswers.filter(input => input.isCorrect)
    if (correctAnswers.length === 0) {
      setError('Please mark at least one answer as correct')
      return
    }

    const answers: Answer[] = validAnswers.map(input => ({
      answerId: input.id,
      answer: input.text.trim(),
      isCorrect: input.isCorrect,
      createdAt: new Date()
    }))

    const newQuestion: Question = {
      questionId: initialQuestion?.questionId || uuidv4(),
      question: questionText.trim(),
      difficulty,
      weight,
      answers,
      createdAt: initialQuestion?.createdAt || new Date()
    }

    onSubmit(newQuestion)
    
    if (!initialQuestion) {
      // Reset form
      setQuestionText('')
      setAnswerInputs([
        { id: uuidv4(), text: '', isCorrect: true },
        { id: uuidv4(), text: '', isCorrect: false },
        { id: uuidv4(), text: '', isCorrect: false },
        { id: uuidv4(), text: '', isCorrect: false }
      ])
      setDifficulty('medium')
      setWeight(1)
    }
  }

  const updateAnswerText = (id: string, text: string) => {
    setAnswerInputs(prev => prev.map(input => 
      input.id === id ? { ...input, text } : input
    ))
  }

  const setCorrectAnswer = (id: string) => {
    setAnswerInputs(prev => prev.map(input => ({
      ...input,
      isCorrect: input.id === id
    })))
  }

  const addAnswer = () => {
    if (answerInputs.length < 6) {
      setAnswerInputs(prev => [...prev, { id: uuidv4(), text: '', isCorrect: false }])
    }
  }

  const removeAnswer = (id: string) => {
    if (answerInputs.length > 2) {
      setAnswerInputs(prev => {
        const newInputs = prev.filter(input => input.id !== id)
        // If we removed the correct answer, make the first one correct
        if (prev.find(input => input.id === id)?.isCorrect && newInputs.length > 0) {
          newInputs[0].isCorrect = true
        }
        return newInputs
      })
    }
  }

  return (
    <Card className="border-2">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Input
              id="question"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Enter your question..."
              className="text-base"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={difficulty} onValueChange={(value: 'easy' | 'medium' | 'hard') => setDifficulty(value)}>
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
              <Label htmlFor="weight">Weight</Label>
              <Input
                id="weight"
                type="number"
                min="1"
                max="10"
                value={weight}
                onChange={(e) => setWeight(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Answers</Label>
              {answerInputs.length < 6 && (
                <Button type="button" variant="outline" size="sm" onClick={addAnswer}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Answer
                </Button>
              )}
            </div>

            <RadioGroup
              value={answerInputs.find(input => input.isCorrect)?.id || ''}
              onValueChange={setCorrectAnswer}
            >
              <div className="space-y-3">
                {answerInputs.map((input, index) => (
                  <div key={input.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <RadioGroupItem value={input.id} id={input.id} />
                    <Label htmlFor={input.id} className="text-sm font-medium">
                      {String.fromCharCode(65 + index)}
                    </Label>
                    <Input
                      value={input.text}
                      onChange={(e) => updateAnswerText(input.id, e.target.value)}
                      placeholder={`Answer ${String.fromCharCode(65 + index)}`}
                      className="flex-1"
                    />
                    {answerInputs.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAnswer(input.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    {input.isCorrect && (
                      <div className="flex items-center gap-1 text-green-600">
                        <Check className="h-4 w-4" />
                        <span className="text-xs">Correct</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="submit" className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              {initialQuestion ? 'Update Question' : 'Add Question'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}