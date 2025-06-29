import React from 'react'
import { Card} from '../../ui/card'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'
import { Question, QuizResult } from '../../../app/types/Course/Lesson/content/quizz'
import { RotateCcw, Trophy, Target, CheckCircle, BookOpen, TrendingUp } from 'lucide-react'

interface QuizResultsProps {
  questions: Question[]
  result: QuizResult
  onRestart: () => void
  onReview: () => void
}

export default function QuizResults({
  result,
  onRestart,
  onReview
}: QuizResultsProps) {
  const getTotalQuestions = () => {
    return result.scoreAnalysis.breakdown.byDifficulty.easy.total +
           result.scoreAnalysis.breakdown.byDifficulty.medium.total +
           result.scoreAnalysis.breakdown.byDifficulty.hard.total;
  };

  const getCorrectAnswers = () => {
    return result.scoreAnalysis.breakdown.byDifficulty.easy.correct +
           result.scoreAnalysis.breakdown.byDifficulty.medium.correct +
           result.scoreAnalysis.breakdown.byDifficulty.hard.correct;
  };

  const isPassed = result.score >= 70;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 h-[calc(100vh-100px)] flex flex-col">
      <Card className={`border shadow-sm flex-grow overflow-hidden ${
        isPassed 
          ? 'border-green-200 bg-green-50/30' 
          : 'border-orange-200 bg-orange-50/30'
      }`}>
        <div className={`p-4 text-center ${
          isPassed 
            ? 'bg-green-600 text-white' 
            : 'bg-orange-600 text-white'
        }`}>
          <div className="flex items-center justify-center mb-2">
            <div className="p-2 bg-white/20 rounded-full">
              {isPassed ? (
                <Trophy className="h-10 w-10" />
              ) : (
                <Target className="h-10 w-10" />
              )}
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {isPassed ? 'Congratulations!' : 'Good Effort!'}
          </h2>
          <div className="text-4xl font-bold mb-2">{result.score}%</div>
          <p className="text-base mb-2">
            You answered {getCorrectAnswers()} out of {getTotalQuestions()} questions correctly
          </p>
          <Badge 
            variant={isPassed ? "default" : "destructive"} 
            className="text-sm px-3 py-1 font-bold"
          >
            {isPassed ? 'PASSED ✓' : 'NEEDS IMPROVEMENT'}
          </Badge>
        </div>

        <div className="flex-grow overflow-y-auto p-4">
          <div className="space-y-4">
            {/* Performance Summary */}
            <div>
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Performance Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="text-center p-3 bg-card rounded-lg border">
                  <BookOpen className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                  <div className="text-xl font-bold text-blue-600">{getTotalQuestions()}</div>
                  <div className="text-xs font-medium text-blue-700 uppercase tracking-wide">Total Questions</div>
                </div>
                <div className="text-center p-3 bg-card rounded-lg border">
                  <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-1" />
                  <div className="text-xl font-bold text-green-600">{getCorrectAnswers()}</div>
                  <div className="text-xs font-medium text-green-700 uppercase tracking-wide">Correct Answers</div>
                </div>
                <div className="text-center p-3 bg-card rounded-lg border">
                  <Trophy className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                  <div className="text-xl font-bold text-purple-600">{result.score}%</div>
                  <div className="text-xs font-medium text-purple-700 uppercase tracking-wide">Final Score</div>
                </div>
              </div>
            </div>

            {/* Performance by Difficulty */}
            <div className="bg-muted/50 p-3 rounded-lg border">
              <h4 className="text-base font-bold mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Performance by Difficulty Level
              </h4>
              <div className="space-y-2">
                {(['easy', 'medium', 'hard'] as const).map((difficulty) => {
                  const stats = result.scoreAnalysis.breakdown.byDifficulty[difficulty];
                  const percentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
                  const difficultyColors = {
                    easy: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', bar: 'bg-green-500' },
                    medium: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', bar: 'bg-yellow-500' },
                    hard: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', bar: 'bg-red-500' }
                  };
                  const colors = difficultyColors[difficulty];
                  
                  return (
                    <div key={difficulty} className={`p-3 rounded-lg border ${colors.bg} ${colors.border}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`${colors.text} border-current text-xs`}>
                            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                          </Badge>
                          <span className={`font-semibold ${colors.text} text-sm`}>
                            {stats.correct}/{stats.total} correct
                          </span>
                        </div>
                        <span className={`text-base font-bold ${colors.text}`}>{percentage}%</span>
                      </div>
                      <div className="w-full bg-white rounded-full h-2 border">
                        <div 
                          className={`h-2 rounded-full transition-all duration-1000 ${colors.bar}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Motivational Message */}
            <div className={`p-3 rounded-lg border ${
              isPassed 
                ? 'bg-green-50/50 border-green-200' 
                : 'bg-blue-50/50 border-blue-200'
            }`}>
              <div className="text-center">
                {isPassed ? (
                  <div>
                    <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
                    <h4 className="text-base font-bold text-green-700 mb-1">Excellent Work!</h4>
                    <p className="text-xs text-green-600">You&apos;ve demonstrated a strong understanding of the material. Keep up the great work!</p>
                  </div>
                ) : (
                  <div>
                    <Target className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                    <h4 className="text-base font-bold text-blue-700 mb-1">Keep Learning!</h4>
                    <p className="text-xs text-blue-600">Review the material and try again. Every attempt helps you learn and improve!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3 p-4 bg-muted/30">
          <Button 
            onClick={onReview}
            size="default"
            variant="outline"
            className="flex items-center gap-2"
          >
            <BookOpen className="h-4 w-4" />
            Review Questions & Answers
          </Button>
          <Button 
            onClick={onRestart} 
            size="default"
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Take Quiz Again
          </Button>
        </div>
      </Card>
    </div>
  )
}
