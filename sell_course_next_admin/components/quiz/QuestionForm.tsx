'use client';
import React, { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent } from '../ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Label } from '../ui/label'
import { QuizFormData } from '../../app/types/quiz'
import { Check, Sparkles, Target, Award } from 'lucide-react'
interface QuestionFormProps {
  onSubmit: (question: QuizFormData) => void
  onCancel?: () => void
  initialQuestion?: QuizFormData | null
  disabled?: boolean
  disabledMessage?: string
}
export default function QuestionForm({ onSubmit, onCancel, initialQuestion, disabled = false, disabledMessage }: QuestionFormProps) {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', '', '', ''])
  const [correctAnswer, setCorrectAnswer] = useState(0)
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [weight, setWeight] = useState(5) // Start with medium default
  const [error, setError] = useState('')
  const [isDirty, setIsDirty] = useState(false)
  const [initialData, setInitialData] = useState<{
    question: string
    options: string[]
    correctAnswer: number
    difficulty: 'easy' | 'medium' | 'hard'
    weight: number
  } | null>(null)

  // Define difficulty point ranges
  const getDifficultyRange = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return { min: 1, max: 4, default: 2 }
      case 'medium': return { min: 5, max: 7, default: 5 }
      case 'hard': return { min: 8, max: 10, default: 8 }
      default: return { min: 5, max: 7, default: 5 }
    }
  }

  // Auto-set weight when difficulty changes
  const handleDifficultyChange = (newDifficulty: 'easy' | 'medium' | 'hard') => {
    const range = getDifficultyRange(newDifficulty)
    setDifficulty(newDifficulty)
    setWeight(range.default)
  }

  // Validate weight against difficulty range
  const validateWeight = (difficulty: string, weight: number) => {
    const range = getDifficultyRange(difficulty)
    return weight >= range.min && weight <= range.max
  }
  useEffect(() => {
    if (initialQuestion) {
      setQuestion(initialQuestion.question)
      setOptions(initialQuestion.options)
      setCorrectAnswer(initialQuestion.correctAnswer)
      setDifficulty(initialQuestion.difficulty || 'medium')
      setWeight(initialQuestion.weight || 5)
      
      // Store initial data for comparison
      setInitialData({
        question: initialQuestion.question,
        options: initialQuestion.options,
        correctAnswer: initialQuestion.correctAnswer,
        difficulty: initialQuestion.difficulty || 'medium',
        weight: initialQuestion.weight || 5
      })
    } else {
      // For new questions, set initial data as empty
      setInitialData({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        difficulty: 'medium',
        weight: 5
      })
    }
    setIsDirty(false)
  }, [initialQuestion])

  // Update dirty state when form changes
  useEffect(() => {
    const checkForChanges = () => {
      if (!initialData) return false
      
      return (
        question !== initialData.question ||
        JSON.stringify(options) !== JSON.stringify(initialData.options) ||
        correctAnswer !== initialData.correctAnswer ||
        difficulty !== initialData.difficulty ||
        weight !== initialData.weight
      )
    }

    setIsDirty(checkForChanges())
  }, [question, options, correctAnswer, difficulty, weight, initialData])

  // Handle cancel with confirmation
  const handleCancel = () => {
    if (isDirty) {
      const isEdit = !!initialQuestion
      const message = isEdit 
        ? "You haven't updated the question yet. Are you sure you want to exit without saving changes?"
        : "You haven't saved the question yet. Are you sure you want to exit without saving?"
      
      if (window.confirm(message)) {
        onCancel?.()
      }
    } else {
      onCancel?.()
    }
  }
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!question.trim() || options.some((opt) => !opt.trim())) {
      setError('Please fill in all fields')
      return
    }
    
    // Validate weight against difficulty range
    if (!validateWeight(difficulty, weight)) {
      const range = getDifficultyRange(difficulty)
      setError(`${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} questions must have ${range.min}-${range.max} points`)
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
      setWeight(5)
    }
  }
  const getDifficultyIcon = (level: string) => {
    switch (level) {
      case 'easy': return <Sparkles className="h-4 w-4 text-green-500" />
      case 'medium': return <Target className="h-4 w-4 text-yellow-500" />
      case 'hard': return <Award className="h-4 w-4 text-red-500" />
      default: return <Target className="h-4 w-4 text-yellow-500" />
    }
  }

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'easy': return 'bg-green-50 border-green-200 text-green-700'
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-700'
      case 'hard': return 'bg-red-50 border-red-200 text-red-700'
      default: return 'bg-yellow-50 border-yellow-200 text-yellow-700'
    }
  }

  return (
    <div>
      {/* Disabled Message */}
      {disabled && disabledMessage && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 bg-red-500 rounded-full"></div>
            <span className="text-red-700 font-medium">{disabledMessage}</span>
          </div>
        </div>
      )}
      
      <Card className={`border-2 shadow-xl bg-white transition-all duration-300 hover:shadow-2xl ${disabled ? 'opacity-60' : ''}`}>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className={`space-y-6 ${disabled ? 'pointer-events-none' : ''}`}>
            {error && (
              <div className="flex items-center gap-3 text-sm text-red-600 bg-red-50 border border-red-200 p-4 rounded-lg animate-in slide-in-from-top-2 duration-300">
                <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                <span className="font-medium">{error}</span>
              </div>
            )}
            
            {/* Question Text Section */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full" />
                Question Text
              </Label>
              <div className="relative">
                <Input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="What would you like to ask your students?"
                  className="h-14 text-base border-2 focus:border-[#513deb] transition-all duration-200 bg-white/80 backdrop-blur-sm"
                  required
                />
                
              </div>
            </div>

            {/* Question Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  {getDifficultyIcon(difficulty)}
                  Difficulty Level
                </Label>
                <Select value={difficulty} onValueChange={handleDifficultyChange}>
                  <SelectTrigger className={`h-12 border-2 transition-all duration-200 ${getDifficultyColor(difficulty)}`}>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy" className="flex items-center gap-2">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-green-500" />
                          Easy
                        </div>
                        <span className="text-xs text-green-600 font-medium">(1-4 pts)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="medium" className="flex items-center gap-2">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-yellow-500" />
                          Medium
                        </div>
                        <span className="text-xs text-yellow-600 font-medium">(5-7 pts)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="hard" className="flex items-center gap-2">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-red-500" />
                          Hard
                        </div>
                        <span className="text-xs text-red-600 font-medium">(8-10 pts)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <div className="h-2 w-2 bg-purple-500 rounded-full" />
                  Points
                  <span className="text-xs text-muted-foreground ml-2">
                    ({getDifficultyRange(difficulty).min}-{getDifficultyRange(difficulty).max} for {difficulty})
                  </span>
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    min={getDifficultyRange(difficulty).min}
                    max={getDifficultyRange(difficulty).max}
                    value={weight}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || getDifficultyRange(difficulty).default
                      const range = getDifficultyRange(difficulty)
                      setWeight(Math.max(range.min, Math.min(range.max, value)))
                    }}
                    className={`h-12 text-base border-2 transition-all duration-200 bg-white/80 backdrop-blur-sm ${
                      validateWeight(difficulty, weight) 
                        ? 'focus:border-[#513deb] border-gray-300' 
                        : 'border-red-300 focus:border-red-500'
                    }`}
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <span className="text-xs text-gray-500 font-medium">pts</span>
                  </div>
                </div>
                
                {/* Point range indicator */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Min: {getDifficultyRange(difficulty).min}</span>
                  <span>Max: {getDifficultyRange(difficulty).max}</span>
                </div>
              </div>
            </div>

            {/* Answer Options */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <div className="h-2 w-2 bg-orange-500 rounded-full" />
                Answer Options
              </Label>
              <div className="space-y-3">
                {options.map((option, index) => (
                  <div key={index} className="group">
                    <div className="flex gap-3 items-center">
                      <div className="w-[calc(100%-160px)] relative">
                        <Input
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...options]
                            newOptions[index] = e.target.value
                            setOptions(newOptions)
                          }}
                          placeholder={`Option ${String.fromCharCode(65 + index)}: Enter answer choice`}
                          className="h-12 text-base border-2 focus:border-[#513deb] transition-all duration-200 bg-white/80 backdrop-blur-sm pl-10 w-full"
                          required
                        />
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                          <span className="text-sm font-bold text-gray-400">
                            {String.fromCharCode(65 + index)}
                          </span>
                        </div>
                       
                      </div>
                      
                      <Button
                        type="button"
                        variant={correctAnswer === index ? 'default' : 'outline'}
                        className={`w-[140px] h-12 transition-all duration-300 transform hover:scale-105 ${
                          correctAnswer === index 
                            ? 'bg-[#513deb] hover:bg-[#4f46e5] text-white shadow-lg shadow-[#513deb]/25' 
                            : 'hover:bg-gray-50 border-2'
                        }`}
                        onClick={() => setCorrectAnswer(index)}
                      >
                        {correctAnswer === index ? (
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4" />
                            <span className="font-semibold">Correct</span>
                          </div>
                        ) : (
                          <span className="font-medium">Mark as Correct</span>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 space-y-3">
              <Button 
                type="submit" 
                disabled={disabled}
                className="w-full h-14 text-base font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl"
                style={{
                  background: 'linear-gradient(135deg, #513deb 0%, #4f46e5 100%)',
                  color: 'white',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #513deb 0%, #4f46e5 100%)';
                }}
              >
                <div className="flex items-center justify-center gap-3">
                  {initialQuestion ? (
                    <>
                      <Check className="h-5 w-5" />
                      Update Question
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Add Question
                    </>
                  )}
                </div>
              </Button>
              
              {/* Cancel Button - Only show if onCancel is provided */}
              {onCancel && (
                <Button 
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="w-full h-12 text-base font-medium border-2 hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </Button>
              )}
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <div className={`h-2 w-2 rounded-full transition-colors duration-200 ${question.trim() ? 'bg-[#513deb]' : 'bg-gray-300'}`} />
              <div className={`h-2 w-2 rounded-full transition-colors duration-200 ${options.every(opt => opt.trim()) ? 'bg-[#513deb]' : 'bg-gray-300'}`} />
              <div className={`h-2 w-2 rounded-full transition-colors duration-200 ${difficulty ? 'bg-[#513deb]' : 'bg-gray-300'}`} />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
