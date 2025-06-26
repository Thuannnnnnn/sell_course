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
      <Card className="border-2 shadow-xl bg-white transition-all duration-300 hover:shadow-2xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <div className={`h-2 w-2 rounded-full transition-colors duration-200 ${question.trim() ? 'bg-green-500' : 'bg-gray-300'}`} />
                </div>
              </div>
            </div>

            {/* Question Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  {getDifficultyIcon(difficulty)}
                  Difficulty Level
                </Label>
                <Select value={difficulty} onValueChange={(value: 'easy' | 'medium' | 'hard') => setDifficulty(value)}>
                  <SelectTrigger className={`h-12 border-2 transition-all duration-200 ${getDifficultyColor(difficulty)}`}>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy" className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-green-500" />
                        Easy
                      </div>
                    </SelectItem>
                    <SelectItem value="medium" className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-yellow-500" />
                        Medium
                      </div>
                    </SelectItem>
                    <SelectItem value="hard" className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-red-500" />
                        Hard
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <div className="h-2 w-2 bg-purple-500 rounded-full" />
                  Points Value
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={weight}
                    onChange={(e) => setWeight(parseInt(e.target.value) || 1)}
                    className="h-12 text-base border-2 focus:border-[#513deb] transition-all duration-200 bg-white/80 backdrop-blur-sm"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <span className="text-xs text-gray-500 font-medium">pts</span>
                  </div>
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
                      <div className="flex-1 relative">
                        <Input
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...options]
                            newOptions[index] = e.target.value
                            setOptions(newOptions)
                          }}
                          placeholder={`Option ${String.fromCharCode(65 + index)}: Enter answer choice`}
                          className="h-12 text-base border-2 focus:border-[#513deb] transition-all duration-200 bg-white/80 backdrop-blur-sm pl-10"
                          required
                        />
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                          <span className="text-sm font-bold text-gray-400">
                            {String.fromCharCode(65 + index)}
                          </span>
                        </div>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                          <div className={`h-2 w-2 rounded-full transition-colors duration-200 ${option.trim() ? 'bg-green-500' : 'bg-gray-300'}`} />
                        </div>
                      </div>
                      
                      <Button
                        type="button"
                        variant={correctAnswer === index ? 'default' : 'outline'}
                        className={`min-w-[120px] h-12 transition-all duration-300 transform hover:scale-105 ${
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

            {/* Submit Button */}
            <div className="pt-4">
              <Button 
                type="submit" 
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
