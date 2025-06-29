'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Trophy, Target, TrendingUp, BookOpen, CheckCircle, AlertCircle, BarChart3, Calendar } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { quizAPI } from '../../lib/api/quiz';
import { QuizResult, QuizResultsListProps } from '../../app/types/Course/Lesson/content/quizz';


export default function QuizResultsList({ 
  courseId, 
  lessonId 
}: QuizResultsListProps) {
  const { data: session } = useSession();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadResults = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!session?.accessToken) {
        throw new Error('Authentication required');
      }

      let response;
      if (courseId && lessonId) {
        response = await quizAPI.getUserQuizResultsByLesson(courseId, lessonId, session.accessToken as string);
      } else if (courseId) {
        response = await quizAPI.getUserQuizResultsByCourse(courseId, session.accessToken as string);
      } else {
        response = await quizAPI.getAllUserQuizResults(session.accessToken as string);
      }

      if (response.success) {
        setResults(response.data || []);
      } else {
        throw new Error(response.message || 'Failed to load quiz results');
      }
    } catch (error) {
      console.error('Error loading quiz results:', error);
      setError(error instanceof Error ? error.message : 'Failed to load quiz results');
    } finally {
      setLoading(false);
    }
  }, [courseId, lessonId, session?.accessToken]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);



  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTotalQuestions = (result: QuizResult) => {
    return result.scoreAnalysis.breakdown.byDifficulty.easy.total +
           result.scoreAnalysis.breakdown.byDifficulty.medium.total +
           result.scoreAnalysis.breakdown.byDifficulty.hard.total;
  };

  const getCorrectAnswers = (result: QuizResult) => {
    return result.scoreAnalysis.breakdown.byDifficulty.easy.correct +
           result.scoreAnalysis.breakdown.byDifficulty.medium.correct +
           result.scoreAnalysis.breakdown.byDifficulty.hard.correct;
  };

  const calculateStats = () => {
    if (results.length === 0) return null;

    const totalQuizzes = results.length;
    const averageScore = results.reduce((sum, result) => sum + result.score, 0) / totalQuizzes;
    const passedQuizzes = results.filter(result => result.score >= 70).length;
    const bestScore = Math.max(...results.map(result => result.score));

    return {
      totalQuizzes,
      averageScore: Math.round(averageScore),
      passedQuizzes,
      passRate: Math.round((passedQuizzes / totalQuizzes) * 100),
      bestScore
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <div className="relative mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto"></div>
              <BarChart3 className="h-8 w-8 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Loading Your Results</h3>
            <p className="text-muted-foreground">Analyzing your quiz performance...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="text-center py-12">
            <div className="p-4 bg-red-50 rounded-full w-fit mx-auto mb-6">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-red-700">Unable to Load Results</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">{error}</p>
            <Button onClick={loadResults} className="w-full">
              <BarChart3 className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-lg border-2 border-dashed border-gray-300">
          <CardContent className="text-center py-16">
            <div className="p-6 bg-gray-50 rounded-full w-fit mx-auto mb-6">
              <Trophy className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold mb-4">No Quiz Results Yet</h3>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Start taking quizzes to track your learning progress and see detailed performance analytics here!
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span>Complete your first quiz to get started</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Enhanced Stats Overview */}
      {stats && (
        <Card className="border-2 border-primary/20 shadow-xl bg-gradient-to-br from-white to-blue-50/30">
          <CardHeader className="text-center pb-6 bg-gradient-to-r from-primary/5 to-blue-50">
            <div className="flex items-center justify-center mb-4">
              <div className="p-4 bg-gradient-to-br from-primary/10 to-blue-100 rounded-full shadow-lg">
                <BarChart3 className="h-10 w-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Your Quiz Performance
            </CardTitle>
            <p className="text-muted-foreground text-lg">Track your learning progress and achievements</p>
          </CardHeader>
          
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-orange-100 rounded-xl border border-yellow-200 shadow-sm">
                <Trophy className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                <div className="font-bold text-yellow-700 text-sm uppercase tracking-wide">Total Quizzes</div>
                <div className="text-4xl font-bold text-yellow-600 mt-2">{stats.totalQuizzes}</div>
                <div className="text-xs text-yellow-600 mt-1">Completed</div>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-sm">
                <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <div className="font-bold text-blue-700 text-sm uppercase tracking-wide">Average Score</div>
                <div className="text-4xl font-bold text-blue-600 mt-2">{stats.averageScore}%</div>
                <div className="text-xs text-blue-600 mt-1">Overall Performance</div>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 shadow-sm">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <div className="font-bold text-green-700 text-sm uppercase tracking-wide">Pass Rate</div>
                <div className="text-4xl font-bold text-green-600 mt-2">{stats.passRate}%</div>
                <div className="text-xs text-green-600 mt-1">Success Rate</div>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 shadow-sm">
                <TrendingUp className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <div className="font-bold text-purple-700 text-sm uppercase tracking-wide">Best Score</div>
                <div className="text-4xl font-bold text-purple-600 mt-2">{stats.bestScore}%</div>
                <div className="text-xs text-purple-600 mt-1">Personal Best</div>
              </div>
            </div>
            
            {/* Performance Insights */}
            <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-xl border border-gray-200">
              <h4 className="font-bold mb-4 flex items-center gap-2 text-lg">
                <TrendingUp className="h-6 w-6 text-primary" />
                Performance Insights
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-3">
                  {stats.averageScore >= 80 ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Target className="h-5 w-5 text-orange-500" />
                  )}
                  <span>
                    {stats.averageScore >= 80 
                      ? "Excellent performance! You're mastering the material." 
                      : "Good progress! Keep practicing to improve your scores."}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {stats.passRate >= 70 ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                  )}
                  <span>
                    {stats.passRate >= 70 
                      ? "Great consistency in passing quizzes!" 
                      : "Focus on understanding concepts before retaking quizzes."}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Results List */}
      <Card className="border-2 border-gray-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50/50 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Quiz History</CardTitle>
            </div>
            <Badge variant="outline" className="px-3 py-1">
              {results.length} {results.length === 1 ? 'Result' : 'Results'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {results.map((result, index) => {
              const isPassed = result.score >= 70;
              const totalQuestions = getTotalQuestions(result);
              const correctAnswers = getCorrectAnswers(result);
              
              return (
                <div
                  key={`${result.quizzId}-${index}`}
                  className={`relative p-6 border-2 rounded-xl transition-all duration-200 hover:shadow-lg ${
                    isPassed 
                      ? 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 hover:border-green-300' 
                      : 'border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`p-3 rounded-full ${
                          isPassed ? 'bg-green-100' : 'bg-orange-100'
                        }`}>
                          {isPassed ? (
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          ) : (
                            <Target className="h-6 w-6 text-orange-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-lg font-bold mb-1">
                            Quiz #{result.quizzId.slice(0, 8)}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(result.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-3 bg-white/70 rounded-lg border">
                          <div className="text-sm font-medium text-muted-foreground">Score</div>
                          <div className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
                            {result.score}%
                          </div>
                        </div>
                        <div className="text-center p-3 bg-white/70 rounded-lg border">
                          <div className="text-sm font-medium text-muted-foreground">Correct</div>
                          <div className="text-2xl font-bold text-blue-600">
                            {correctAnswers}/{totalQuestions}
                          </div>
                        </div>
                        <div className="text-center p-3 bg-white/70 rounded-lg border">
                          <div className="text-sm font-medium text-muted-foreground">Status</div>
                          <Badge 
                            variant={isPassed ? "default" : "destructive"}
                            className="text-sm font-semibold mt-1"
                          >
                            {isPassed ? "PASSED" : "FAILED"}
                          </Badge>
                        </div>
                      </div>

                      {/* Difficulty Breakdown */}
                      <div className="bg-white/70 p-4 rounded-lg border">
                        <h5 className="font-semibold mb-3 text-sm">Performance by Difficulty</h5>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center p-2 bg-green-50 rounded border border-green-200">
                            <div className="text-xs font-medium text-green-700">Easy</div>
                            <div className="text-sm font-bold text-green-600">
                              {result.scoreAnalysis.breakdown.byDifficulty.easy.correct}/
                              {result.scoreAnalysis.breakdown.byDifficulty.easy.total}
                            </div>
                          </div>
                          <div className="text-center p-2 bg-yellow-50 rounded border border-yellow-200">
                            <div className="text-xs font-medium text-yellow-700">Medium</div>
                            <div className="text-sm font-bold text-yellow-600">
                              {result.scoreAnalysis.breakdown.byDifficulty.medium.correct}/
                              {result.scoreAnalysis.breakdown.byDifficulty.medium.total}
                            </div>
                          </div>
                          <div className="text-center p-2 bg-red-50 rounded border border-red-200">
                            <div className="text-xs font-medium text-red-700">Hard</div>
                            <div className="text-sm font-bold text-red-600">
                              {result.scoreAnalysis.breakdown.byDifficulty.hard.correct}/
                              {result.scoreAnalysis.breakdown.byDifficulty.hard.total}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Score Badge */}
                    <div className="absolute top-4 right-4">
                      <div className={`text-center p-3 rounded-full border-4 ${
                        isPassed 
                          ? 'border-green-200 bg-green-100' 
                          : 'border-orange-200 bg-orange-100'
                      }`}>
                        <div className={`text-2xl font-bold ${
                          isPassed ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {result.score}%
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
    </div>
  );
}