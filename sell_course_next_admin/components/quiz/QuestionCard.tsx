'use client';

import React from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { QuizFormData } from '../../app/types/quiz'
import { Check, Pencil, Trash2, Star } from 'lucide-react'
import { formatDifficulty, getDifficultyColor } from '../../lib/quiz-utils'
interface QuestionCardProps {
  question: QuizFormData
  onEdit: (question: QuizFormData) => void
  onDelete: (id: string) => void
}
export default function QuestionCard({
  question,
  onEdit,
  onDelete,
}: QuestionCardProps) {
  const getDifficultyIcon = (level: string) => {
    switch (level) {
      case 'easy': return '🟢'
      case 'medium': return '🟡'
      case 'hard': return '🔴'
      default: return '🟡'
    }
  }

  const getDifficultyGradient = (level: string) => {
    switch (level) {
      case 'easy': return 'from-green-100 to-green-50 border-green-200'
      case 'medium': return 'from-yellow-100 to-yellow-50 border-yellow-200'
      case 'hard': return 'from-red-100 to-red-50 border-red-200'
      default: return 'from-yellow-100 to-yellow-50 border-yellow-200'
    }
  }

  return (
    <Card className="group border-2 hover:border-[#513deb]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#513deb]/10 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge 
              className={`text-xs font-semibold px-3 py-1 bg-gradient-to-r ${getDifficultyGradient(question.difficulty || 'medium')} transition-all duration-200 hover:scale-105`}
              variant="secondary"
            >
              <span className="mr-1">{getDifficultyIcon(question.difficulty || 'medium')}</span>
              {formatDifficulty(question.difficulty || 'medium')}
            </Badge>
            {question.weight && question.weight > 1 && (
              <Badge variant="outline" className="text-xs flex items-center gap-1 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 text-purple-700 hover:scale-105 transition-transform duration-200">
                <Star className="h-3 w-3 text-yellow-500" />
                {question.weight} pts
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <h3 className="text-lg font-semibold mb-5 text-gray-800 group-hover:text-[#513deb] transition-colors duration-200">
          {question.question}
        </h3>
        
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <div
              key={index}
              className={`relative flex items-center p-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] ${
                index === question.correctAnswer 
                  ? 'bg-gradient-to-r from-[#513deb]/10 to-[#4f46e5]/10 border-2 border-[#513deb]/30 shadow-lg shadow-[#513deb]/10' 
                  : 'bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border border-gray-200'
              }`}
            >
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  index === question.correctAnswer 
                    ? 'bg-[#513deb] text-white' 
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {String.fromCharCode(65 + index)}
                </div>
              </div>
              
              <span className="flex-1 ml-10 text-gray-700 font-medium">{option}</span>
              
              {index === question.correctAnswer && (
                <div className="flex items-center gap-2">
                  <div className="bg-[#513deb] text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 animate-pulse">
                    <Check className="h-3 w-3" />
                    Correct
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end gap-3 pt-6 bg-gradient-to-r from-gray-50/50 to-white">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(question)}
          className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 transform hover:scale-105"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(question.id)}
          className="flex items-center gap-2 hover:bg-red-600 transition-all duration-200 transform hover:scale-105"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  )
}
