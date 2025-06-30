import React from 'react'
import { Card, CardContent, CardFooter } from '../../ui/card'
import { Button } from '../../ui/button'
import { Question } from '../../../app/types/Course/Lesson/content/quizz'
import { Check, Pencil, Trash2 } from 'lucide-react'
interface QuestionCardProps {
  question: Question
  onEdit: (question: Question) => void
  onDelete: (id: string) => void
}
export default function QuestionCard({
  question,
  onEdit,
  onDelete,
}: QuestionCardProps) {
  return (
    <Card className="border-2 hover:border-primary/50 transition-all">
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-4">{question.question}</h3>
        <div className="space-y-3">
          {question.answers.map((answer) => (
            <div
              key={answer.answerId}
              className={`flex items-center p-3 rounded-lg transition-colors
                ${answer.isCorrect ? 'bg-primary/10 border-2 border-primary/30' : 'bg-muted hover:bg-muted/70'}
              `}
            >
              <span className="flex-1">{answer.answer}</span>
              {answer.isCorrect && (
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
          onClick={() => onDelete(question.questionId)}
          className="flex items-center gap-1"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  )
}
