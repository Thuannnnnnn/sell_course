'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { CheckCircle, AlertCircle, ArrowLeft, ArrowRight, BookOpen, Target, Trophy, Timer, RotateCcw, BarChart3 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { quizAPI } from '../../lib/api/quiz';
import { Question, QuizResult, QuizResultResponse, QuizTakingProps } from '../../app/types/Course/Lesson/content/quizz';



export default function QuizTaking({
  courseId,
  lessonId,
  contentId,
  quizId,
  onComplete
}: QuizTakingProps) {
  const { data: session } = useSession();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes
  const [quizStarted, setQuizStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<QuizResult | null>(null);
  const [currentQuizId, setCurrentQuizId] = useState<string>('');
  const [showReview, setShowReview] = useState(false);

  const loadQuiz = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!session?.accessToken) {
        throw new Error('Authentication required');
      }

      const response = quizId 
        ? await quizAPI.getQuiz(courseId, lessonId, contentId, quizId, session.accessToken as string)
        : await quizAPI.getRandomQuiz(courseId, lessonId, contentId, undefined, session.accessToken as string);

      console.log('Quiz response:', response);

      // Backend trả về trực tiếp quiz object, không wrap trong success/data
      if (response && response.questions) {
        setQuestions(response.questions);
        setCurrentQuizId(response.quizzId);
      } else {
        throw new Error('Failed to load quiz - invalid response format');
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
      setError(error instanceof Error ? error.message : 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  }, [courseId, lessonId, contentId, quizId, session?.accessToken]);

  const handleSubmitQuiz = useCallback(async () => {
    try {
      setSubmitting(true);

      if (!session?.accessToken) {
        throw new Error('Authentication required');
      }

      const answers = Object.entries(selectedAnswers).map(([questionId, answerId]) => ({
        questionId,
        answerId
      }));

      const submitData = {
        quizzId: quizId || currentQuizId,
        answers
      };

      const response: QuizResultResponse = await quizAPI.submitQuiz(
        courseId,
        lessonId,
        contentId,
        quizId || currentQuizId,
        submitData,
        session.accessToken as string
      );

      // Backend trả về QuizResultResponse với data là array QuizResult[]
      if (response.success && response.data && Array.isArray(response.data) && response.data.length > 0) {
        // Lấy kết quả đầu tiên từ array
        const quizResult = response.data[0];
        
        setResults(quizResult);
        setShowResults(true);
        
        if (onComplete) {
          onComplete(quizResult.score, quizResult);
        }
      } else {
        throw new Error('Invalid quiz result response format');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  }, [courseId, lessonId, contentId, quizId, currentQuizId, selectedAnswers, onComplete, session?.accessToken]);

  // Load quiz
  useEffect(() => {
    // Kiểm tra xem có cần hiển thị màn hình xem lại hay không
    const shouldShowReview = localStorage.getItem(`quiz_${courseId}_${lessonId}_${contentId}_review`);
    if (shouldShowReview === 'true') {
      // Xóa tham số để tránh hiển thị màn hình xem lại mỗi khi component được tải lại
      localStorage.removeItem(`quiz_${courseId}_${lessonId}_${contentId}_review`);
      
      // Tải kết quả bài kiểm tra từ localStorage
      try {
        const quizResults = JSON.parse(localStorage.getItem(`quiz_${courseId}_${lessonId}_${contentId}`) || '[]');
        if (quizResults.length > 0) {
          // Lấy kết quả bài kiểm tra gần nhất
          const latestResult = quizResults[0];
          setResults(latestResult);
          setShowResults(true);
          setShowReview(true);
          return;
        }
      } catch (error) {
        console.error('Error loading quiz results from localStorage:', error);
      }
    }
    
    // Nếu không cần hiển thị màn hình xem lại hoặc không có kết quả bài kiểm tra, tải bài kiểm tra mới
    loadQuiz();
  }, [loadQuiz, courseId, lessonId, contentId]);

  // Timer
  useEffect(() => {
    if (!quizStarted || timeLeft <= 0 || showResults) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, timeLeft, showResults, handleSubmitQuiz]);

  const handleStartQuiz = () => {
    setQuizStarted(true);
  };

  const handleViewReview = () => {
    setShowReview(true);
  };

  const handleBackToResults = () => {
    setShowReview(false);
  };

  const handleSelectAnswer = (questionId: string, answerId: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const answeredCount = Object.keys(selectedAnswers).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <div className="relative mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto"></div>
              <BookOpen className="h-8 w-8 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Preparing Your Quiz</h3>
            <p className="text-muted-foreground">Getting everything ready for you...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="text-center py-12">
            <div className="p-4 bg-red-50 rounded-full w-fit mx-auto mb-6">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-red-700">Oops! Something went wrong</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">{error}</p>
            <div className="space-y-3">
              <Button onClick={loadQuiz} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Questions Available</h3>
          <p className="text-muted-foreground">This quiz doesn&apos;t have any questions yet.</p>
        </CardContent>
      </Card>
    );
  }

  // Show quiz review
  if (showReview && results && questions.length > 0) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 space-y-6 overflow-hidden">
        {/* Review Header */}
        <Card className="border shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-bold">Quiz Review</h2>
                  <p className="text-sm text-muted-foreground">Review all questions, your answers, and correct solutions</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="px-3 py-1">
                    Score: {results.score}%
                  </Badge>
                  <Badge variant={results.score >= 70 ? "default" : "destructive"} className="px-3 py-1">
                    {results.score >= 70 ? "PASSED" : "FAILED"}
                  </Badge>
                </div>
                <Button variant="outline" onClick={handleBackToResults}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Results
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Review Summary */}
        <Card className="border shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Review Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
                <div className="text-xs text-muted-foreground">Total Questions</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">
                  {questions.filter((q) => selectedAnswers[q.questionId] === q.answers.find(a => a.isCorrect)?.answerId).length}
                </div>
                <div className="text-xs text-green-700">Correct Answers</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="text-2xl font-bold text-red-600">
                  {questions.filter((q) => selectedAnswers[q.questionId] && selectedAnswers[q.questionId] !== q.answers.find(a => a.isCorrect)?.answerId).length}
                </div>
                <div className="text-xs text-red-700">Incorrect Answers</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-2xl font-bold text-orange-600">
                  {questions.filter((q) => !selectedAnswers[q.questionId]).length}
                </div>
                <div className="text-xs text-orange-700">Unanswered</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Review Questions */}
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-bold mb-2">All Questions & Answers</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Review each question below. Correct answers are highlighted in green, incorrect answers in red.
            </p>
          </div>
          
          {questions.map((question, questionIndex) => {
            const userAnswerId = selectedAnswers[question.questionId];
            const correctAnswer = question.answers.find(answer => answer.isCorrect);
            // const userAnswer = question.answers.find(answer => answer.answerId === userAnswerId);
            const isCorrect = userAnswerId === correctAnswer?.answerId;

            return (
              <Card key={question.questionId} className={`border ${isCorrect ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-2 rounded-full flex-shrink-0 ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <h3 className="text-lg font-semibold">Question {questionIndex + 1}</h3>
                        <Badge variant="outline" className="text-xs">
                          {question.difficulty?.charAt(0).toUpperCase() + question.difficulty?.slice(1)}
                        </Badge>
                        <Badge variant={isCorrect ? "default" : "destructive"} className="text-xs">
                          {isCorrect ? "✓ Correct" : "✗ Incorrect"}
                        </Badge>
                      </div>
                      <p className="text-base mb-4 break-words">{question.question}</p>
                      
                      <div className="space-y-3">
                        {question.answers.map((answer, answerIndex) => {
                          const isUserAnswer = answer.answerId === userAnswerId;
                          const isCorrectAnswer = answer.isCorrect;
                          const optionLetter = String.fromCharCode(65 + answerIndex);
                          
                          let borderColor = 'border-border';
                          let bgColor = 'bg-card';
                          let textColor = 'text-foreground';
                          
                          if (isCorrectAnswer) {
                            borderColor = 'border-green-300';
                            bgColor = 'bg-green-50';
                            textColor = 'text-green-700';
                          } else if (isUserAnswer && !isCorrectAnswer) {
                            borderColor = 'border-red-300';
                            bgColor = 'bg-red-50';
                            textColor = 'text-red-700';
                          }
                          
                          return (
                            <div
                              key={answer.answerId}
                              className={`p-3 rounded-lg border ${borderColor} ${bgColor}`}
                            >
                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                <div className="flex items-center gap-3 flex-1">
                                  <div className={`flex items-center justify-center h-7 w-7 rounded-full border-2 text-sm font-bold flex-shrink-0
                                    ${isCorrectAnswer 
                                      ? 'border-green-500 bg-green-500 text-white' 
                                      : isUserAnswer 
                                        ? 'border-red-500 bg-red-500 text-white'
                                        : 'border-muted-foreground text-muted-foreground'}
                                  `}>
                                    {optionLetter}
                                  </div>
                                  <span className={`text-sm ${textColor} font-medium break-words`}>
                                    {answer.answer}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {isCorrectAnswer && (
                                    <Badge variant="default" className="text-xs bg-green-600 text-white">
                                      ✓ Correct Answer
                                    </Badge>
                                  )}
                                  {isUserAnswer && !isCorrectAnswer && (
                                    <Badge variant="destructive" className="text-xs">
                                      ✗ Your Answer
                                    </Badge>
                                  )}
                                  {isUserAnswer && isCorrectAnswer && (
                                    <Badge variant="default" className="text-xs bg-green-600 text-white">
                                      ✓ Your Correct Answer
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Always show explanation for learning purposes */}
                      <div className={`mt-4 p-3 border rounded-lg ${
                        isCorrect 
                          ? 'bg-green-50/50 border-green-200' 
                          : 'bg-blue-50/50 border-blue-200'
                      }`}>
                        <div className="flex items-start gap-2">
                          <BookOpen className={`h-4 w-4 mt-0.5 ${isCorrect ? 'text-green-600' : 'text-blue-600'}`} />
                          <div>
                            <p className={`text-sm font-medium ${isCorrect ? 'text-green-700' : 'text-blue-700'}`}>
                              {isCorrect ? 'Well done!' : 'Explanation:'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {isCorrect 
                                ? `You correctly identified "${correctAnswer?.answer}" as the right answer.`
                                : `The correct answer is "${correctAnswer?.answer}".`
                              }
                              {question.explanation && (
                                <span className="block mt-1">{question.explanation}</span>
                              )}
                              {!question.explanation && !isCorrect && (
                                <span className="block mt-1">Review the course material to understand this concept better.</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Review Footer */}
        <Card className="border shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Review completed • {questions.filter((q) => selectedAnswers[q.questionId] === q.answers.find(a => a.isCorrect)?.answerId).length} of {questions.length} questions answered correctly</span>
                </div>
                <p className="mt-1 text-xs">
                  Use this review to understand the concepts better and improve your knowledge.
                </p>
              </div>
              <div className="flex gap-3 flex-shrink-0">
                <Button variant="outline" onClick={handleBackToResults}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Results
                </Button>
                <Button onClick={() => window.location.reload()}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retake Quiz
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResults && results) {
    const correctAnswers = results.scoreAnalysis.breakdown.byDifficulty.easy.correct + 
                          results.scoreAnalysis.breakdown.byDifficulty.medium.correct + 
                          results.scoreAnalysis.breakdown.byDifficulty.hard.correct;
    const isPassed = results.score >= 70;
    
    return (
      <div className="w-full max-w-4xl mx-auto px-4 overflow-hidden">
        <Card className={`border shadow-sm ${isPassed ? 'border-green-200 bg-green-50/30' : 'border-orange-200 bg-orange-50/30'}`}>
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className={`p-4 rounded-full ${isPassed ? 'bg-green-100' : 'bg-orange-100'}`}>
                {isPassed ? (
                  <Trophy className="h-12 w-12 text-green-600" />
                ) : (
                  <Target className="h-12 w-12 text-orange-600" />
                )}
              </div>
            </div>
            <CardTitle className="text-3xl font-bold mb-3">
              {isPassed ? 'Congratulations!' : 'Good Effort!'}
            </CardTitle>
            <p className="text-lg text-muted-foreground">
              {isPassed ? 'You passed the quiz!' : 'Keep practicing to improve your score'}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Score Display */}
            <div className="text-center">
              <div className={`text-6xl font-bold mb-3 ${isPassed ? 'text-green-600' : 'text-orange-600'}`}>
                {results.score}%
              </div>
              <Badge 
                variant={isPassed ? "default" : "destructive"} 
                className="text-base px-3 py-1 font-semibold"
              >
                {isPassed ? 'PASSED' : 'NEEDS IMPROVEMENT'}
              </Badge>
            </div>

            {/* Performance Summary */}
            <div className="text-center bg-muted/50 p-4 rounded-lg border">
              <p className="text-base mb-2">
                You answered <span className="font-bold text-primary">{correctAnswers}</span> out of{' '}
                <span className="font-bold">{questions.length}</span> questions correctly
              </p>
              <div className="w-full bg-muted rounded-full h-2 mt-3 mb-3">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ${isPassed ? 'bg-green-500' : 'bg-orange-500'}`}
                  style={{ width: `${results.score}%` }}
                ></div>
              </div>
              <Button 
                onClick={handleViewReview}
                size="sm"
                variant="outline"
                className="flex items-center gap-2 mx-auto"
              >
                <BookOpen className="h-4 w-4" />
                Review All Questions
              </Button>
            </div>
            
            {/* Detailed Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-card rounded-lg border">
                <BookOpen className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <div className="font-bold text-blue-700 text-xs uppercase tracking-wide">Total Questions</div>
                <div className="text-2xl font-bold text-blue-600 mt-1">{questions.length}</div>
              </div>
              <div className="text-center p-4 bg-card rounded-lg border">
                <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <div className="font-bold text-green-700 text-xs uppercase tracking-wide">Correct Answers</div>
                <div className="text-2xl font-bold text-green-600 mt-1">{correctAnswers}</div>
              </div>
              <div className="text-center p-4 bg-card rounded-lg border">
                <Trophy className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <div className="font-bold text-purple-700 text-xs uppercase tracking-wide">Final Score</div>
                <div className="text-2xl font-bold text-purple-600 mt-1">{results.score}%</div>
              </div>
            </div>

            {/* Performance by Difficulty */}
            <div className="bg-white/50 p-6 rounded-xl border">
              <h4 className="font-semibold mb-4 text-center">Performance by Difficulty</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="font-semibold text-green-700">Easy</div>
                  <div className="text-xl font-bold text-green-600">
                    {results.scoreAnalysis.breakdown.byDifficulty.easy.correct}/{results.scoreAnalysis.breakdown.byDifficulty.easy.total}
                  </div>
                  <div className="text-sm text-green-600">
                    {Math.round(results.scoreAnalysis.breakdown.byDifficulty.easy.percentage)}%
                  </div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="font-semibold text-yellow-700">Medium</div>
                  <div className="text-xl font-bold text-yellow-600">
                    {results.scoreAnalysis.breakdown.byDifficulty.medium.correct}/{results.scoreAnalysis.breakdown.byDifficulty.medium.total}
                  </div>
                  <div className="text-sm text-yellow-600">
                    {Math.round(results.scoreAnalysis.breakdown.byDifficulty.medium.percentage)}%
                  </div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="font-semibold text-red-700">Hard</div>
                  <div className="text-xl font-bold text-red-600">
                    {results.scoreAnalysis.breakdown.byDifficulty.hard.correct}/{results.scoreAnalysis.breakdown.byDifficulty.hard.total}
                  </div>
                  <div className="text-sm text-red-600">
                    {Math.round(results.scoreAnalysis.breakdown.byDifficulty.hard.percentage)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleViewReview}
                size="lg"
                className="flex items-center gap-2"
              >
                <BookOpen className="h-5 w-5" />
                Review Questions & Answers
              </Button>
              <Button 
                onClick={() => window.location.reload()} 
                size="lg"
                variant="outline"
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-5 w-5" />
                Retake Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 overflow-hidden">
        <Card className="border shadow-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Target className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold mb-2">Ready for Your Quiz?</CardTitle>
            <p className="text-muted-foreground">Test your knowledge and track your progress</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quiz Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <BookOpen className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <div className="font-bold text-blue-700 text-xs uppercase tracking-wide">Questions</div>
                <div className="text-2xl font-bold text-blue-600 mt-1">{questions.length}</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                <Timer className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <div className="font-bold text-green-700 text-xs uppercase tracking-wide">Time Limit</div>
                <div className="text-2xl font-bold text-green-600 mt-1">30 min</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                <Trophy className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <div className="font-bold text-purple-700 text-xs uppercase tracking-wide">Passing Score</div>
                <div className="text-2xl font-bold text-purple-600 mt-1">50%</div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Instructions
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Read each question carefully and select the best answer</li>
                <li>• You can navigate between questions and change your answers</li>
                <li>• Submit before time runs out to save your progress</li>
                <li>• You can retake the quiz to improve your score</li>
              </ul>
            </div>

            <Button 
              onClick={handleStartQuiz} 
              size="lg" 
              className="w-full"
            >
              <Target className="h-4 w-4 mr-2" />
              Start Quiz Now
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 space-y-6 overflow-hidden">
      {/* Enhanced Header */}
      <Card className="border shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 min-w-0 flex-1">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1 bg-primary/10 rounded-full flex-shrink-0">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="text-base font-bold">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {answeredCount} of {questions.length} answered
                  </div>
                </div>
              </div>
              
              <Badge variant="outline" className="px-2 py-1 text-xs flex-shrink-0">
                {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
                timeLeft < 300 
                  ? 'border-red-200 bg-red-50 text-red-700' 
                  : timeLeft < 600 
                    ? 'border-orange-200 bg-orange-50 text-orange-700'
                    : 'border-green-200 bg-green-50 text-green-700'
              }`}>
                <Timer className="h-3 w-3" />
                <span className="font-bold text-sm">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">Progress</span>
              <span className="text-muted-foreground">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Question Card */}
      <Card className="border shadow-sm">
        <CardContent className="p-6 space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold leading-relaxed mb-3">{currentQuestion.question}</h2>
            <p className="text-sm text-muted-foreground">Choose the best answer from the options below</p>
          </div>
          
          <div className="space-y-3">
            {currentQuestion.answers.map((answer, index) => {
              const isSelected = selectedAnswers[currentQuestion.questionId] === answer.answerId;
              const optionLetter = String.fromCharCode(65 + index);
              
              return (
                <div
                  key={answer.answerId}
                  className={`group relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md
                    ${isSelected 
                      ? 'border-primary bg-gradient-to-r from-primary/10 to-blue-50 shadow-lg' 
                      : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'}
                  `}
                  onClick={() => handleSelectAnswer(currentQuestion.questionId, answer.answerId)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex items-center justify-center h-8 w-8 rounded-full border-2 text-base font-bold transition-all
                      ${isSelected 
                        ? 'border-primary bg-primary text-white shadow-lg' 
                        : 'border-gray-300 text-gray-500 group-hover:border-primary group-hover:text-primary'}
                    `}
                    >
                      {optionLetter}
                    </div>
                    <span className={`text-base leading-relaxed ${isSelected ? 'font-semibold text-primary' : 'text-gray-700'}`}>
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

      {/* Enhanced Navigation */}
      <Card className="border shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 px-4 w-full sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
                selectedAnswers[currentQuestion.questionId] 
                  ? 'border-green-200 bg-green-50 text-green-700' 
                  : 'border-orange-200 bg-orange-50 text-orange-700'
              }`}>
                {selectedAnswers[currentQuestion.questionId] ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <span className="font-medium text-sm">
                  {selectedAnswers[currentQuestion.questionId] ? 'Answered' : 'Not Answered'}
                </span>
              </div>
            </div>

            {currentQuestionIndex === questions.length - 1 ? (
              <Button
                onClick={handleSubmitQuiz}
                disabled={submitting || answeredCount === 0}
                size="sm"
                className="flex items-center gap-2 px-4 bg-green-600 hover:bg-green-700 w-full sm:w-auto"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Trophy className="h-4 w-4" />
                    Submit Quiz
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                size="sm"
                className="flex items-center gap-2 px-4 w-full sm:w-auto"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Question Overview */}
      <Card className="border-2 border-gray-200 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Question Navigator
            </CardTitle>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-primary border border-primary rounded"></div>
                <span>Current</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                <span>Unanswered</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-10 gap-3">
            {questions.map((question, index) => (
              <button
                key={question.questionId}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`
                  relative w-12 h-12 rounded-lg text-sm font-bold transition-all duration-200 transform hover:scale-105 border-2
                  ${index === currentQuestionIndex
                    ? 'bg-primary text-white border-primary shadow-lg'
                    : selectedAnswers[question.questionId]
                    ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                  }
                `}
              >
                {index + 1}
                {selectedAnswers[question.questionId] && index !== currentQuestionIndex && (
                  <div className="absolute -top-1 -right-1">
                    <CheckCircle className="h-4 w-4 text-green-600 bg-white rounded-full" />
                  </div>
                )}
              </button>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-blue-700">Progress Summary</span>
              <span className="text-blue-600">{answeredCount} of {questions.length} completed</span>
            </div>
            <div className="mt-2">
              <Progress value={(answeredCount / questions.length) * 100} className="h-2 bg-blue-100" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}