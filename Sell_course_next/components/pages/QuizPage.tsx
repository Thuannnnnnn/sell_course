'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Clock, AlertCircle, CheckCircle, BookOpen, Target, Trophy, Timer, ArrowLeft, ArrowRight } from 'lucide-react';
import QuizQuestion from '../course/quiz/QuizQuestion';
import QuizResults from '../course/quiz/QuizResults';
import { useQuiz } from '../../hooks/useQuiz';
import { QuizResult } from '../../app/types/Course/Lesson/content/quizz';

interface QuizPageProps {
  courseId: string;
  lessonId: string;
  contentId: string;
  quizId?: string;
  onComplete?: (score: number, results: QuizResult) => void;
}

export default function QuizPage({
  courseId,
  lessonId,
  contentId,
  quizId,
  onComplete
}: QuizPageProps) {
  const {
    questions,
    currentQuestion,
    currentQuestionIndex,
    selectedAnswers,
    isLoading,
    isSubmitting,
    error,
    quizResult,
    isCompleted,
    timeLeft,
    quizStarted,
    progress,
    answeredCount,
    isLastQuestion,
    canSubmit,
    startQuiz,
    selectAnswer,
    goToQuestion,
    nextQuestion,
    previousQuestion,
    submitQuiz,
    resetQuiz,
  } = useQuiz({ courseId, lessonId, contentId, quizId });

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = (answerIndex: number) => {
    if (currentQuestion && currentQuestion.answers && currentQuestion.answers[answerIndex]) {
      const answerId = currentQuestion.answers[answerIndex].answerId;
      if (answerId) {
        selectAnswer(currentQuestionIndex, answerId);
      }
    }
  };

  const handleSubmitQuiz = async () => {
    const result = await submitQuiz();
    if (result && onComplete) {
      onComplete(result.score, result);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="text-center py-12">
            <div className="p-4 bg-red-50 rounded-full w-fit mx-auto mb-6">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-red-700">Quiz Loading Failed</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">{error}</p>
            <div className="space-y-3">
              <Button onClick={() => window.location.reload()} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <div className="relative mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto"></div>
              <BookOpen className="h-8 w-8 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Preparing Your Quiz</h3>
            <p className="text-muted-foreground">Loading questions and setting up your assessment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Card className="w-full max-w-lg border-2 border-dashed border-gray-300">
          <CardContent className="text-center py-16">
            <div className="p-6 bg-gray-50 rounded-full w-fit mx-auto mb-6">
              <AlertCircle className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold mb-4">No Quiz Available</h3>
            <p className="text-muted-foreground text-lg leading-relaxed">
              There are no quiz questions available for this content yet. Please check back later or contact your instructor.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="border-2 border-primary/20 shadow-lg">
          <CardHeader className="text-center pb-6 bg-gradient-to-r from-primary/5 to-blue-50">
            <div className="flex items-center justify-center mb-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Target className="h-10 w-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold mb-2">Ready for Your Quiz?</CardTitle>
            <p className="text-muted-foreground text-lg">Test your knowledge and track your progress</p>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            {/* Quiz Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <div className="font-bold text-blue-700 text-sm uppercase tracking-wide">Questions</div>
                <div className="text-3xl font-bold text-blue-600 mt-1">{questions.length}</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                <Timer className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <div className="font-bold text-green-700 text-sm uppercase tracking-wide">Time Limit</div>
                <div className="text-3xl font-bold text-green-600 mt-1">30 min</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                <Trophy className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <div className="font-bold text-purple-700 text-sm uppercase tracking-wide">Passing Score</div>
                <div className="text-3xl font-bold text-purple-600 mt-1">50%</div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Quiz Instructions
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-primary/10 rounded-full mt-1">
                      <Timer className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm leading-relaxed">You have 30 minutes to complete all questions</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-primary/10 rounded-full mt-1">
                      <ArrowRight className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm leading-relaxed">Navigate between questions and change answers anytime</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-primary/10 rounded-full mt-1">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm leading-relaxed">Answer all questions before submitting for best results</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-primary/10 rounded-full mt-1">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm leading-relaxed">Your progress is automatically saved</span>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              onClick={startQuiz} 
              size="lg" 
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg"
            >
              <Target className="h-5 w-5 mr-2" />
              Start Quiz Now
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isCompleted && quizResult) {
    // const transformedQuestions = questions.map(q => transformQuestionForComponent(q));
    // const userAnswers = selectedAnswers.map((answerId, index) => {
    //   if (!answerId) return 0;
    //   const question = questions[index];
    //   return question.answers.findIndex(a => a.answerId === answerId);
    // });

    return (
      <QuizResults
        questions={questions}
        result={quizResult}
        onRestart={resetQuiz}
        onReview={() => {
          // Implement review functionality if needed
          console.log('Review functionality not implemented in QuizPage');
        }}
      />
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <p>No current question available</p>
        </div>
      </div>
    );
  }

  const currentSelectedAnswerIndex = selectedAnswers[currentQuestionIndex] && currentQuestion?.answers
    ? currentQuestion.answers.findIndex(a => a.answerId === selectedAnswers[currentQuestionIndex])
    : null;

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <Card className="mb-4 flex-shrink-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="text-sm text-muted-foreground">
                {answeredCount} answered
              </span>
            </div>
            
            {timeLeft !== null && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span className={timeLeft < 300 ? 'text-red-600 font-semibold' : ''}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
          </div>
          
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Question - Main content that takes available space */}
      <div className="flex-grow overflow-auto mb-4">
        <QuizQuestion
          question={currentQuestion}
          selectedOption={currentSelectedAnswerIndex}
          onSelectOption={handleSelectAnswer}
        />
      </div>

      {/* Navigation - Fixed at bottom */}
      <div className="flex-shrink-0">
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={previousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {selectedAnswers[currentQuestionIndex] !== null && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                <span className="text-sm text-muted-foreground">
                  {selectedAnswers[currentQuestionIndex] !== null ? 'Answered' : 'Not answered'}
                </span>
              </div>

              {isLastQuestion ? (
                <Button
                  onClick={handleSubmitQuiz}
                  disabled={isSubmitting || !canSubmit}
                  className="min-w-[100px]"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                </Button>
              ) : (
                <Button onClick={nextQuestion}>
                  Next
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Question Overview */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-lg">Question Overview</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToQuestion(index)}
                  className={`
                    w-8 h-8 rounded text-xs font-medium transition-colors
                    ${index === currentQuestionIndex
                      ? 'bg-primary text-primary-foreground'
                      : selectedAnswers[index] !== null
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}