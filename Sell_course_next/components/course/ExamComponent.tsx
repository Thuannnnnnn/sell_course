'use client'
import React from 'react'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { Button } from '../ui/button'
import { Clock, FileText, Lock, AlertTriangle } from 'lucide-react'
import { cn } from '../../lib/utils'
interface ExamComponentProps {
  exam: {
    id: number
    title: string
    questions: number
    duration: string
    isLocked: boolean
  }
}
export function ExamComponent({ exam }: ExamComponentProps) {
  return (
    <Card
      className={cn(
        'overflow-hidden transition-all',
        exam.isLocked ? 'opacity-80' : 'hover:shadow-md',
      )}
    >
      <CardHeader className="bg-primary/5 pb-2">
        <CardTitle className="flex justify-between items-start">
          <span>{exam.title}</span>
          {exam.isLocked && <Lock className="h-5 w-5 text-muted-foreground" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary p-2 rounded-full">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Questions</div>
              <div className="font-medium">{exam.questions} questions</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary p-2 rounded-full">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Duration</div>
              <div className="font-medium">{exam.duration}</div>
            </div>
          </div>
          {exam.isLocked && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <AlertTriangle className="h-4 w-4" />
              <div className="text-sm">
                Complete previous modules to unlock this exam
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          disabled={exam.isLocked}
          variant={exam.isLocked ? 'outline' : 'default'}
        >
          {exam.isLocked ? 'Locked' : 'Start Exam'}
        </Button>
      </CardFooter>
    </Card>
  )
}
