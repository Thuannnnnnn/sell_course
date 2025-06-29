import React from 'react'
import { Card, CardContent } from '../../ui/card'
import { Badge } from '../../ui/badge'
import { CheckCircle } from 'lucide-react'
import { Question } from '../../../app/types/Course/Lesson/content/quizz'

interface QuizQuestionProps {
  question: Question
  selectedOption: number | null
  onSelectOption: (option: number) => void
}

export default function QuizQuestion({
  question,
  selectedOption,
  onSelectOption,
}: QuizQuestionProps) {
  return (
    <Card className="border shadow-sm">
      <CardContent className="p-6 space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <h2 className="text-xl font-bold leading-relaxed">{question.question}</h2>
            {question.difficulty && (
              <Badge variant="outline" className="px-2 py-1 text-xs">
                {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">Choose the best answer from the options below</p>
        </div>
        
        <div className="space-y-3">
          {question.answers.map((answer, index) => {
            const isSelected = selectedOption === index;
            const optionLetter = String.fromCharCode(65 + index);
            
            return (
              <div
                key={answer.answerId}
                className={`group relative p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md
                  ${isSelected 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'}
                `}
                onClick={() => onSelectOption(index)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center justify-center h-8 w-8 rounded-full border-2 text-base font-bold transition-all
                    ${isSelected 
                      ? 'border-primary bg-primary text-primary-foreground' 
                      : 'border-muted-foreground text-muted-foreground group-hover:border-primary group-hover:text-primary'}
                  `}
                  >
                    {optionLetter}
                  </div>
                  <span className={`text-base leading-relaxed break-words ${isSelected ? 'font-semibold text-primary' : 'text-foreground'}`}>
                    {answer.answer}
                  </span>
                </div>
                
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  )
}
