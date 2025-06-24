'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  AlertCircle,
  ArrowLeft,
  Clock,
  HelpCircle
} from 'lucide-react';
import { quizApi } from '../../api/quiz/quiz';
import { Quiz } from '../../types/quiz';
import { formatDifficulty, getDifficultyColor } from '../../../lib/quiz-utils';

export default function QuizManagePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId');
  const lessonId = searchParams.get('lessonId');
  const contentId = searchParams.get('contentId');

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadQuizzes = useCallback(async () => {
    if (!courseId || !lessonId || !contentId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await quizApi.getQuizzesByContentId(courseId, lessonId, contentId);
      setQuizzes(data);
    } catch (err) {
      const error = err as Error & { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || error.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  }, [courseId, lessonId, contentId]);

  useEffect(() => {
    if (courseId && lessonId && contentId) {
      loadQuizzes();
    }
  }, [courseId, lessonId, contentId, loadQuizzes]);

  const handleCreateQuiz = () => {
    const params = new URLSearchParams({
      courseId: courseId || '',
      lessonId: lessonId || '',
      contentId: contentId || '',
    });
    router.push(`/quiz?${params.toString()}`);
  };

  const handleEditQuiz = (quizId: string) => {
    const params = new URLSearchParams({
      courseId: courseId || '',
      lessonId: lessonId || '',
      contentId: contentId || '',
      quizId,
    });
    router.push(`/quiz?${params.toString()}`);
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!courseId || !lessonId || !contentId) return;
    
    if (!confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return;
    }

    setDeleting(quizId);
    try {
      await quizApi.deleteQuiz(courseId, lessonId, contentId, quizId);
      setQuizzes(quizzes.filter(quiz => quiz.quizzId !== quizId));
    } catch (err) {
      const error = err as Error & { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || error.message || 'Failed to delete quiz');
    } finally {
      setDeleting(null);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="container max-w-6xl px-4 py-12">
        <div className="flex flex-col space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGoBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="rounded-lg bg-primary/10 p-3">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">
                  Quiz Management
                </h1>
                <p className="text-lg text-muted-foreground mt-1">
                  Manage quizzes for this content
                </p>
              </div>
            </div>
            <Button onClick={handleCreateQuiz} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New Quiz
            </Button>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Quiz List */}
          {quizzes.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="flex flex-col items-center justify-center p-12">
                <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No quizzes found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Get started by creating your first quiz for this content.
                </p>
                <Button onClick={handleCreateQuiz} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create First Quiz
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {quizzes.map((quiz) => (
                <Card key={quiz.quizzId} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Quiz #{quiz.quizzId.slice(-8)}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {new Date(quiz.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Questions:</span>
                      <Badge variant="secondary">
                        {quiz.questions.length} questions
                      </Badge>
                    </div>
                    
                    {quiz.questions.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-sm font-medium">Difficulty Levels:</span>
                        <div className="flex flex-wrap gap-1">
                          {Array.from(new Set(quiz.questions.map(q => q.difficulty))).map(difficulty => (
                            <Badge 
                              key={difficulty} 
                              className={`text-xs ${getDifficultyColor(difficulty)}`}
                              variant="secondary"
                            >
                              {formatDifficulty(difficulty)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditQuiz(quiz.quizzId)}
                        className="flex-1 flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteQuiz(quiz.quizzId)}
                        disabled={deleting === quiz.quizzId}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        {deleting === quiz.quizzId ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}