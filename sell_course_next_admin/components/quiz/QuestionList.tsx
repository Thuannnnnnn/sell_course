'use client';
import React from 'react'
import QuestionCard from './QuestionCard'
import { QuizFormData } from '../../app/types/quiz'
interface QuestionListProps {
  questions: QuizFormData[]
  onEdit: (question: QuizFormData) => void
  onDelete: (id: string) => void
}
export default function QuestionList({
  questions,
  onEdit,
  onDelete,
}: QuestionListProps) {
  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/30">
        <div className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-lg">No questions added yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Questions you create will appear here
        </p>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      {questions.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
