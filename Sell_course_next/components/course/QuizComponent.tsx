import React, { useState} from 'react'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { CheckCircle, AlertCircle } from 'lucide-react'
interface QuizComponentProps {
  lesson: {
    id: string
    title: string
    quiz: {
      id: string
      questions: {
        id: number
        question: string
        options: string[]
        correctAnswer: string
      }[]
    }
  }
}
export function QuizComponent({ lesson }: QuizComponentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  // Mock quiz questions
  const questions = [
    {
      id: 1,
      question: 'What does HTML stand for?',
      options: [
        'Hyper Text Markup Language',
        'Hyper Transfer Markup Language',
        'High Text Machine Language',
        'Hyper Technical Modern Language',
      ],
      correctAnswer: 'Hyper Text Markup Language',
    },
    {
      id: 2,
      question: 'Which HTML tag is used to define an unordered list?',
      options: ['<ol>', '<list>', '<ul>', '<unordered>'],
      correctAnswer: '<ul>',
    },
    {
      id: 3,
      question: 'What is the correct HTML for creating a hyperlink?',
      options: [
        '<a>http://example.com</a>',
        "<a url='http://example.com'>Example</a>",
        "<a href='http://example.com'>Example</a>",
        "<link href='http://example.com'>Example</link>",
      ],
      correctAnswer: "<a href='http://example.com'>Example</a>",
    },
  ]
  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setIsAnswerSubmitted(false)
    } else {
      // Quiz completed
      setIsCompleted(true)
    }
  }
  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return
    setIsAnswerSubmitted(true)
    if (selectedAnswer === questions[currentQuestion].correctAnswer) {
      setScore(score + 1)
    }
  }
  const progress = ((currentQuestion + 1) / questions.length) * 100
  if (isCompleted) {
    return (
      <Card className="p-6 text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Quiz Completed!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-4xl font-bold">
                {Math.round((score / questions.length) * 100)}%
              </span>
            </div>
          </div>
          <div className="text-xl">
            You scored {score} out of {questions.length}
          </div>
          {score === questions.length ? (
            <div className="flex items-center justify-center gap-2 text-green-500">
              <CheckCircle />
              <span>Perfect score! Great job!</span>
            </div>
          ) : (
            <div className="text-muted-foreground">
              Review the material and try again to improve your score.
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            onClick={() => {
              setCurrentQuestion(0)
              setSelectedAnswer(null)
              setIsAnswerSubmitted(false)
              setScore(0)
              setIsCompleted(false)
            }}
          >
            Retry Quiz
          </Button>
        </CardFooter>
      </Card>
    )
  }
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm font-medium">
          Question {currentQuestion + 1} of {questions.length}
        </div>
        <div className="text-sm font-medium">
          Score: {score}/{currentQuestion}
        </div>
      </div>
      <Progress value={progress} className="mb-8" />
      <Card>
        <CardHeader>
          <CardTitle>{questions[currentQuestion].question}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedAnswer || ''}
            onValueChange={setSelectedAnswer}
            disabled={isAnswerSubmitted}
          >
            {questions[currentQuestion].options.map((option, index) => (
              <div
                key={index}
                className={`flex items-center space-x-2 border p-4 rounded-md mb-2 ${isAnswerSubmitted ? (option === questions[currentQuestion].correctAnswer ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : selectedAnswer === option ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : '') : 'hover:bg-accent'}`}
              >
                <RadioGroupItem
                  value={option}
                  id={`option-${index}`}
                  className="border-primary"
                />
                <Label
                  htmlFor={`option-${index}`}
                  className="flex-1 cursor-pointer py-2"
                >
                  {option}
                </Label>
                {isAnswerSubmitted &&
                  option === questions[currentQuestion].correctAnswer && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                {isAnswerSubmitted &&
                  selectedAnswer === option &&
                  option !== questions[currentQuestion].correctAnswer && (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div>
            {isAnswerSubmitted && (
              <div
                className={`text-sm ${selectedAnswer === questions[currentQuestion].correctAnswer ? 'text-green-500' : 'text-red-500'}`}
              >
                {selectedAnswer === questions[currentQuestion].correctAnswer
                  ? 'Correct! Good job.'
                  : `Incorrect. The correct answer is: ${questions[currentQuestion].correctAnswer}`}
              </div>
            )}
          </div>
          <div>
            {isAnswerSubmitted ? (
              <Button onClick={handleNextQuestion}>
                {currentQuestion < questions.length - 1
                  ? 'Next Question'
                  : 'Finish Quiz'}
              </Button>
            ) : (
              <Button onClick={handleSubmitAnswer} disabled={!selectedAnswer}>
                Submit Answer
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
