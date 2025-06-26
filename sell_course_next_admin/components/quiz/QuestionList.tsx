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
    <div className="space-y-6 p-6 smooth-scroll">
      {questions.map((question, index) => (
        <div 
          key={question.id} 
          className="relative animate-fade-in-up"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {/* Question Number Badge */}
          <div className="absolute -left-3 -top-3 z-10">
            <div className="bg-gradient-to-r from-[#513deb] to-[#4f46e5] text-white text-sm font-bold rounded-full h-10 w-10 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border-2 border-white">
              {index + 1}
            </div>
          </div>
          
          <div className="ml-4">
            <QuestionCard
              question={question}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        </div>
      ))}
      
      {/* Summary Footer */}
      <div className="mt-8 p-6 bg-gradient-to-r from-[#513deb]/5 via-[#4f46e5]/5 to-[#6366f1]/5 rounded-xl border border-[#513deb]/20 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#513deb]">{questions.length}</div>
              <div className="text-xs text-gray-600 font-medium">Questions</div>
            </div>
            <div className="h-8 w-px bg-gray-300"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#4f46e5]">
                {questions.reduce((sum, q) => sum + (q.weight || 1), 0)}
              </div>
              <div className="text-xs text-gray-600 font-medium">Total Points</div>
            </div>
            <div className="h-8 w-px bg-gray-300"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#6366f1]">
                {questions.length > 0 ? Math.round((questions.reduce((sum, q) => sum + (q.weight || 1), 0) / questions.length) * 10) / 10 : 0}
              </div>
              <div className="text-xs text-gray-600 font-medium">Avg Points</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 font-medium">Quiz Ready</span>
          </div>
        </div>
      </div>
    </div>
  )
}
