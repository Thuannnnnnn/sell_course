"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Play,
  Trophy,
  Clock,
  BookOpen,
  BarChart3,
  Target,
  CheckCircle,
  TrendingUp,
  RotateCcw,
} from "lucide-react";
import QuizTaking from "./QuizTaking";
import QuizResultsList from "./QuizResultsList";
import QuizReview from "./QuizReview";
import { QuizResult } from "../../app/types/Course/Lesson/content/quizz";

interface QuizIntegrationProps {
  courseId: string;
  lessonId: string;
  contentId: string;
  quizId?: string;
  title?: string;
  description?: string;
  showResults?: boolean;
  onComplete?: (score: number, results: QuizResult) => void;
  isCompleted?: boolean;
}

type ViewMode = "overview" | "taking" | "results" | "review";

export default function QuizIntegration({
  courseId,
  lessonId,
  contentId,
  quizId,
  title = "Quiz",
  description = "Test your knowledge with this quiz",
  showResults = true,
  onComplete,
  isCompleted = false,
}: QuizIntegrationProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [completed, setCompleted] = useState(isCompleted);
  const [lastScore, setLastScore] = useState<number | null>(null);

  // Hàm tính điểm từ kết quả quiz
  const calculateScore = (results: QuizResult): number => {
    if (Array.isArray(results)) {
      const correctAnswers = results.filter((result) => result.correct).length;
      const totalQuestions = results.length;
      return totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0;
    }

    // Nếu results không phải array, có thể là object với score
    if (typeof results === "object" && results !== null && "score" in results) {
      return typeof results.score === "number" ? Math.round(results.score) : 0;
    }

    return 0;
  };

  // Kiểm tra xem có pass không (>= 50%)
  const isPassingScore = (score: number): boolean => {
    return score >= 50;
  };

  const handleStartQuiz = () => {
    setViewMode("taking");
  };

  const handleQuizComplete = (score: number, results: QuizResult) => {
    // Tính điểm chính xác từ kết quả
    const calculatedScore =
      score !== undefined ? score : calculateScore(results);
    setLastScore(calculatedScore);

    // Kiểm tra điều kiện hoàn thành (>= 50%)
    const isPassed = isPassingScore(calculatedScore);
    setCompleted(isPassed);

    // Hiển thị màn hình kết quả
    setViewMode("results");

    // Lưu kết quả bài kiểm tra
    try {
      const quizResults = JSON.parse(
        localStorage.getItem(`quiz_${courseId}_${lessonId}_${contentId}`) ||
          "[]"
      );
      const resultToSave = {
        ...results,
        score: calculatedScore,
        passed: isPassed,
        completedAt: new Date().toISOString(),
        quizId: quizId || contentId,
      };
      quizResults.unshift(resultToSave);
      localStorage.setItem(
        `quiz_${courseId}_${lessonId}_${contentId}`,
        JSON.stringify(quizResults)
      );
    } catch (error) {
      console.error("Error saving quiz results to localStorage:", error);
    }

    // Gọi callback nếu quiz được hoàn thành (pass)
    if (onComplete && isPassed) {
      onComplete(calculatedScore, results);
    }
  };

  const handleViewResults = () => {
    setViewMode("results");
  };

  const handleViewReview = () => {
    setViewMode("review");
  };

  const handleBackToOverview = () => {
    setViewMode("overview");
  };

  if (viewMode === "taking") {
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

  if (viewMode === "review") {
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
          quizId={quizId || ""}
          onBack={handleBackToOverview}
        />
      </div>
    );
  }

  if (viewMode === "results") {
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
        {lastScore !== null ? (
          <div className="w-full max-w-4xl mx-auto px-4 overflow-hidden">
            <Card
              className={`border shadow-sm ${
                isPassingScore(lastScore)
                  ? "border-green-200 bg-green-50/30"
                  : "border-red-200 bg-red-50/30"
              }`}
            >
              <CardHeader className="text-center pb-6">
                <div className="flex items-center justify-center mb-4">
                  <div
                    className={`p-4 rounded-full ${
                      isPassingScore(lastScore) ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    {isPassingScore(lastScore) ? (
                      <Trophy className="h-12 w-12 text-green-600" />
                    ) : (
                      <Target className="h-12 w-12 text-red-600" />
                    )}
                  </div>
                </div>
                <CardTitle className="text-3xl font-bold mb-3">
                  {isPassingScore(lastScore)
                    ? "Congratulations! Quiz Completed!"
                    : "Keep Trying!"}
                </CardTitle>
                <p className="text-lg text-muted-foreground">
                  {isPassingScore(lastScore)
                    ? "You have successfully completed this quiz!"
                    : "You need at least 50% to complete this quiz. Try again!"}
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Score Display */}
                <div className="text-center">
                  <div
                    className={`text-6xl font-bold mb-3 ${
                      isPassingScore(lastScore)
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {lastScore}%
                  </div>
                  <Badge
                    variant={
                      isPassingScore(lastScore) ? "default" : "destructive"
                    }
                    className="text-base px-3 py-1 font-semibold"
                  >
                    {isPassingScore(lastScore)
                      ? "COMPLETED ✓"
                      : "NOT COMPLETED - RETRY NEEDED"}
                  </Badge>

                  {/* Progress indication */}
                  <div className="mt-4 max-w-md mx-auto">
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                      <span>Progress</span>
                      <span>{lastScore}% of 50% required</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          isPassingScore(lastScore)
                            ? "bg-green-500"
                            : lastScore >= 25
                            ? "bg-orange-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${Math.min(lastScore, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0%</span>
                      <span className="font-medium text-primary">
                        50% (Required)
                      </span>
                      <span>100%</span>
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
                    onClick={() => setViewMode("taking")}
                    size="lg"
                    variant={isPassingScore(lastScore) ? "outline" : "default"}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-5 w-5" />
                    {isPassingScore(lastScore) ? "Retake Quiz" : "Try Again"}
                  </Button>
                </div>

                {/* Motivational message */}
                {!isPassingScore(lastScore) && (
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-blue-800 font-medium">
                      💡 Dont give up! Youre {50 - lastScore}% away from
                      completing this quiz.
                    </p>
                    <p className="text-blue-600 text-sm mt-1">
                      Review the questions and try again. You can do it!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <QuizResultsList courseId={courseId} lessonId={lessonId} />
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
          <CardTitle className="text-3xl font-bold mb-3">{title}</CardTitle>
          <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {description}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Enhanced Quiz Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg border">
              <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="font-bold text-blue-700 text-xs uppercase tracking-wide">
                Time Limit
              </div>
              <div className="text-2xl font-bold text-blue-600 mt-1">
                30 min
              </div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg border">
              <Trophy className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="font-bold text-green-700 text-xs uppercase tracking-wide">
                Completion Score
              </div>
              <div className="text-2xl font-bold text-green-600 mt-1">50%</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg border">
              <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <div className="font-bold text-purple-700 text-xs uppercase tracking-wide">
                Attempts
              </div>
              <div className="text-2xl font-bold text-purple-600 mt-1">
                Unlimited
              </div>
            </div>
          </div>

          {/* Enhanced Last Score Display */}
          {lastScore !== null && (
            <div
              className={`text-center p-4 rounded-lg border ${
                isPassingScore(lastScore)
                  ? "bg-green-50/50 border-green-200"
                  : "bg-red-50/50 border-red-200"
              }`}
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                {isPassingScore(lastScore) ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <Target className="h-6 w-6 text-red-600" />
                )}
                <span className="text-lg font-bold">Your Latest Score</span>
              </div>
              <div
                className={`text-4xl font-bold mb-3 ${
                  isPassingScore(lastScore) ? "text-green-600" : "text-red-600"
                }`}
              >
                {lastScore}%
              </div>
              <Badge
                variant={isPassingScore(lastScore) ? "default" : "destructive"}
                className="text-base px-3 py-1 font-semibold"
              >
                {isPassingScore(lastScore) ? "COMPLETED ✓" : "NOT COMPLETED"}
              </Badge>
              {isPassingScore(lastScore) ? (
                <p className="text-green-700 mt-2 text-sm font-medium">
                  Excellent! You&apos;ve successfully completed this quiz!
                </p>
              ) : (
                <p className="text-red-700 mt-2 text-sm font-medium">
                  You need at least 50% to complete this quiz. Keep trying!
                </p>
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
                <span>
                  Read each question carefully and select the best answer
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  You need at least 50% correct answers to complete this quiz
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  Navigate between questions and change your answers anytime
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Submit before time runs out to save your progress</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>
                  Retake the quiz as many times as you want to improve
                </span>
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
              {completed ? "Retake Quiz" : "Start Quiz Now"}
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

      {/* Quick Stats (if have last score) */}
      {lastScore !== null && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {lastScore}%
                </div>
                <div className="text-sm text-blue-700">Last Score</div>
              </div>
              <div
                className={`text-center p-3 rounded-lg ${
                  isPassingScore(lastScore) ? "bg-green-50" : "bg-red-50"
                }`}
              >
                <div
                  className={`text-lg font-bold ${
                    isPassingScore(lastScore)
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {isPassingScore(lastScore) ? "Completed" : "Not Completed"}
                </div>
                <div
                  className={`text-sm ${
                    isPassingScore(lastScore)
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  Status
                </div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">
                  {isPassingScore(lastScore)
                    ? "50%+"
                    : `${50 - lastScore}% to go`}
                </div>
                <div className="text-sm text-purple-700">Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
