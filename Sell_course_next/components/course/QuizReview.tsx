'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CheckCircle, AlertCircle, ArrowLeft, BookOpen, BarChart3 } from 'lucide-react';
import { Question, QuizResult } from '../../app/types/Course/Lesson/content/quizz';
import { quizAPI } from '../../lib/api/quiz';
import { useSession } from 'next-auth/react';

interface QuizReviewProps {
  courseId: string;
  lessonId: string;
  contentId: string;
  quizId: string;
  onBack: () => void;
}

export default function QuizReview({
  courseId,
  lessonId,
  contentId,
  quizId,
  onBack
}: QuizReviewProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<QuizResult | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const loadQuizResults = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!session?.accessToken) {
          throw new Error('Authentication required');
        }

        // Tải kết quả bài kiểm tra
        const response = await quizAPI.getQuizResults(
          courseId,
          lessonId,
          contentId,
          quizId,
          session.accessToken as string
        );

        console.log('Quiz results response:', response);

        // First, load the quiz questions regardless of results
        const quizResponse = await quizAPI.getQuiz(
          courseId,
          lessonId,
          contentId,
          quizId,
          session.accessToken as string
        );
        
        console.log('Quiz questions response:', quizResponse);
        
        if (quizResponse && quizResponse.questions) {
          setQuestions(quizResponse.questions);
        }

        // Then check if we have results
        // Handle both formats: direct QuizResult object or QuizResultResponse with data array
        let quizResult: QuizResult | null = null;
        
        if (response) {
          if ('success' in response && response.data && Array.isArray(response.data) && response.data.length > 0) {
            // Standard response format with data array
            quizResult = response.data[0];
          } else if ('storeId' in response && 'score' in response && 'answers' in response) {
            // Direct QuizResult object format
            quizResult = response as unknown as QuizResult;
          }
        }
        
        if (quizResult) {
          setResults(quizResult);
          
          // Lấy câu trả lời của người dùng
          const answers: { [key: string]: string } = {};
          quizResult.answers.forEach(answer => {
            if (answer.answerId) {
              answers[answer.questionId] = answer.answerId;
            }
          });
          setSelectedAnswers(answers);
        } else {
          console.warn('Quiz results not found or empty:', response);
          throw new Error('No quiz results found. You may need to take this quiz first.');
        }
      } catch (error) {
        console.error('Error loading quiz results:', error);
        setError(error instanceof Error ? error.message : 'Failed to load quiz results');
      } finally {
        setLoading(false);
      }
    };

    loadQuizResults();
  }, [courseId, lessonId, contentId, quizId, session?.accessToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <div className="relative mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto"></div>
              <BookOpen className="h-8 w-8 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Loading Quiz Review</h3>
            <p className="text-muted-foreground">Getting your quiz results...</p>
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
            <Button onClick={onBack} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!results || questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <div className="p-4 bg-yellow-50 rounded-full w-fit mx-auto mb-6">
              <AlertCircle className="h-12 w-12 text-yellow-500" />
            </div>
            <h3 className="text-xl font-semibold mb-3">No Quiz Results Found</h3>
            <p className="text-muted-foreground mb-6">We couldn&apos;t find any quiz results to review.</p>
            <Button onClick={onBack} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 space-y-6">
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
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Quiz
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

      {/* Review Questions - Now in a scrollable container */}
      <Card className="border shadow-sm">
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <h3 className="text-lg font-bold mb-2">All Questions & Answers</h3>
            <p className="text-sm text-muted-foreground">
              Review each question below. Correct answers are highlighted in green, incorrect answers in red.
            </p>
          </div>
          
          <div className="max-h-[calc(100vh-300px)] overflow-y-auto pr-2 space-y-6">
            {questions.map((question, questionIndex) => {
              const userAnswerId = selectedAnswers[question.questionId];
              const correctAnswer = question.answers.find(answer => answer.isCorrect);
              const isCorrect = userAnswerId === correctAnswer?.answerId;

              return (
                <div key={question.questionId} className={`border rounded-lg p-6 ${isCorrect ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'}`}>
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
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

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
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}