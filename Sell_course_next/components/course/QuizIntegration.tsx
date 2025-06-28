'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Play, Trophy, Clock, BookOpen, BarChart3, Target, CheckCircle, TrendingUp, RotateCcw } from 'lucide-react';
import QuizTaking from './QuizTaking';
import QuizResultsList from './QuizResultsList';
import QuizReview from './QuizReview';
import { QuizResult } from '../../app/types/Course/Lesson/content/quizz';

interface QuizIntegrationProps {
  courseId: string;
  lessonId: string;
  contentId: string;
  quizId?: string;
  title?: string;
  description?: string;
  showResults?: boolean;
  onComplete?: (score: number, results: QuizResult) => void;
}

type ViewMode = 'overview' | 'taking' | 'results' | 'review';

export default function QuizIntegration({
  courseId,
  lessonId,
  contentId,
  quizId,
  title = "Quiz",
  description = "Test your knowledge with this quiz",
  showResults = true,
  onComplete
}: QuizIntegrationProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [completed, setCompleted] = useState(false);
  const [lastScore, setLastScore] = useState<number | null>(null);

  const handleStartQuiz = () => {
    setViewMode('taking');
  };

  const handleQuizComplete = (score: number, results: QuizResult) => {
    setLastScore(score);
    setCompleted(true);
    // Hiển thị màn hình kết quả
    setViewMode('results');
    
    // Lưu kết quả bài kiểm tra vào localStorage để có thể xem lại sau này
    try {
      const quizResults = JSON.parse(localStorage.getItem(`quiz_${courseId}_${lessonId}_${contentId}`) || '[]');
      quizResults.unshift(results);
      localStorage.setItem(`quiz_${courseId}_${lessonId}_${contentId}`, JSON.stringify(quizResults));
    } catch (error) {
      console.error('Error saving quiz results to localStorage:', error);
    }
    
    if (onComplete) {
      onComplete(score, results);
    }
  };

  const handleViewResults = () => {
    setViewMode('results');
  };

  const handleViewReview = () => {
    setViewMode('review');
  };

  const handleBackToOverview = () => {
    setViewMode('overview');
  };

  if (viewMode === 'taking') {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={handleBackToOverview}
          className="mb-4"
        >
          ← Back to Overview
        </Button>
        <QuizTaking
          courseId={courseId}
          lessonId={lessonId}
          contentId={contentId}
          quizId={quizId}
          onComplete={handleQuizComplete}
        />
      </div>
    );
  }
  
  if (viewMode === 'review') {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={handleBackToOverview}
          className="mb-4"
        >
          ← Back to Overview
        </Button>
        <QuizReview
          courseId={courseId}
          lessonId={lessonId}
          contentId={contentId}
          quizId={quizId || ''}
          onBack={handleBackToOverview}
        />
      </div>
    );
  }

  if (viewMode === 'results') {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={handleBackToOverview}
          className="mb-4"
        >
          ← Back to Overview
        </Button>
        {/* Hiển thị kết quả bài kiểm tra gần nhất nếu có */}
        {completed && lastScore !== null ? (
          <div className="w-full max-w-4xl mx-auto px-4 overflow-hidden">
            <Card className={`border shadow-sm ${lastScore >= 70 ? 'border-green-200 bg-green-50/30' : 'border-orange-200 bg-orange-50/30'}`}>
              <CardHeader className="text-center pb-6">
                <div className="flex items-center justify-center mb-4">
                  <div className={`p-4 rounded-full ${lastScore >= 70 ? 'bg-green-100' : 'bg-orange-100'}`}>
                    {lastScore >= 70 ? (
                      <Trophy className="h-12 w-12 text-green-600" />
                    ) : (
                      <Target className="h-12 w-12 text-orange-600" />
                    )}
                  </div>
                </div>
                <CardTitle className="text-3xl font-bold mb-3">
                  {lastScore >= 70 ? 'Congratulations!' : 'Good Effort!'}
                </CardTitle>
                <p className="text-lg text-muted-foreground">
                  {lastScore >= 70 ? 'You passed the quiz!' : 'Keep practicing to improve your score'}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Score Display */}
                <div className="text-center">
                  <div className={`text-6xl font-bold mb-3 ${lastScore >= 70 ? 'text-green-600' : 'text-orange-600'}`}>
                    {lastScore}%
                  </div>
                  <Badge 
                    variant={lastScore >= 70 ? "default" : "destructive"} 
                    className="text-base px-3 py-1 font-semibold"
                  >
                    {lastScore >= 70 ? 'PASSED' : 'NEEDS IMPROVEMENT'}
                  </Badge>
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
                    onClick={() => setViewMode('taking')} 
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
        ) : (
          <QuizResultsList 
            courseId={courseId}
            lessonId={lessonId}
          />
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 overflow-hidden">
      {/* Enhanced Quiz Overview */}
      <Card className="border shadow-sm">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Target className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold mb-3">
            {title}
          </CardTitle>
          <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">{description}</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Enhanced Quiz Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg border">
              <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="font-bold text-blue-700 text-xs uppercase tracking-wide">Time Limit</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">30 min</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg border">
              <Trophy className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="font-bold text-green-700 text-xs uppercase tracking-wide">Passing Score</div>
              <div className="text-2xl font-bold text-green-600 mt-1">70%</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg border">
              <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <div className="font-bold text-purple-700 text-xs uppercase tracking-wide">Attempts</div>
              <div className="text-2xl font-bold text-purple-600 mt-1">Unlimited</div>
            </div>
          </div>

          {/* Enhanced Last Score Display */}
          {completed && lastScore !== null && (
            <div className={`text-center p-4 rounded-lg border ${
              lastScore >= 70 
                ? 'bg-green-50/50 border-green-200' 
                : 'bg-orange-50/50 border-orange-200'
            }`}>
              <div className="flex items-center justify-center gap-2 mb-3">
                {lastScore >= 70 ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <Target className="h-6 w-6 text-orange-600" />
                )}
                <span className="text-lg font-bold">Your Latest Score</span>
              </div>
              <div className={`text-4xl font-bold mb-3 ${
                lastScore >= 70 ? 'text-green-600' : 'text-orange-600'
              }`}>
                {lastScore}%
              </div>
              <Badge 
                variant={lastScore >= 70 ? "default" : "destructive"}
                className="text-base px-3 py-1 font-semibold"
              >
                {lastScore >= 70 ? "PASSED ✓" : "NEEDS IMPROVEMENT"}
              </Badge>
              {lastScore >= 70 && (
                <p className="text-green-700 mt-2 text-sm font-medium">Congratulations! You&apos;ve mastered this topic!</p>
              )}
            </div>
          )}

          {/* Enhanced Instructions */}
          <div className="bg-muted/50 p-4 rounded-lg border">
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Instructions
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Read each question carefully and select the best answer</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Navigate between questions and change your answers anytime</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Submit before time runs out to save your progress</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Retake the quiz as many times as you want to improve</span>
              </li>
            </ul>
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={handleStartQuiz} 
              size="lg" 
              className="flex items-center gap-2"
            >
              <Play className="h-5 w-5" />
              {completed ? 'Retake Quiz' : 'Start Quiz Now'}
            </Button>
            
            {showResults && (
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleViewResults}
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-5 w-5" />
                View Performance
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats (if completed) */}
      {completed && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">{lastScore}%</div>
                <div className="text-sm text-blue-700">Last Score</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {lastScore && lastScore >= 70 ? 'Passed' : 'Failed'}
                </div>
                <div className="text-sm text-green-700">Status</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">1</div>
                <div className="text-sm text-purple-700">Attempts</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}