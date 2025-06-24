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
  return (
    <Card className="border-2 hover:border-primary/50 transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge 
              className={`text-xs ${getDifficultyColor(question.difficulty || 'medium')}`}
              variant="secondary"
            >
              {formatDifficulty(question.difficulty || 'medium')}
            </Badge>
            {question.weight && question.weight > 1 && (
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <Star className="h-3 w-3" />
                {question.weight} pts
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <h3 className="text-lg font-medium mb-4">{question.question}</h3>
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <div
              key={index}
              className={`flex items-center p-3 rounded-lg transition-colors
                ${index === question.correctAnswer ? 'bg-primary/10 border-2 border-primary/30' : 'bg-muted hover:bg-muted/70'}
              `}
            >
              <span className="flex-1">{option}</span>
              {index === question.correctAnswer && (
                <span className="flex items-center gap-1 text-sm text-primary font-medium">
                  <Check className="h-4 w-4" />
                  Correct
                </span>
              )}
            </div>
          ))}
        </div>
        

      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(question)}
          className="flex items-center gap-1"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(question.id)}
          className="flex items-center gap-1"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  )
}
