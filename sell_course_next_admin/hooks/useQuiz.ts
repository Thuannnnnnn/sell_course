import { useState, useCallback } from 'react';
import { quizApi } from '../app/api/quiz/quiz';
import { QuizFormData, CreateQuizDto } from '../app/types/quiz';
import { convertQuizFormToDto, convertQuizToFormDataArray, validateQuizFormDataArray } from '../lib/quiz-utils';

export interface UseQuizOptions {
  courseId?: string;
  lessonId?: string;
  contentId?: string;
  quizId?: string;
}

export interface UseQuizReturn {
  // State
  questions: QuizFormData[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  success: string | null;
  
  // Actions
  setQuestions: (questions: QuizFormData[]) => void;
  addQuestion: (question: QuizFormData) => void;
  updateQuestion: (question: QuizFormData) => void;
  deleteQuestion: (id: string) => void;
  loadQuiz: () => Promise<void>;
  saveQuiz: () => Promise<void>;
  clearMessages: () => void;
}

export const useQuiz = (options: UseQuizOptions): UseQuizReturn => {
  const { courseId, lessonId, contentId, quizId } = options;
  
  const [questions, setQuestions] = useState<QuizFormData[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const addQuestion = useCallback((question: QuizFormData) => {
    const newQuestion = { ...question, id: Math.random().toString(36).substr(2, 9) };
    setQuestions(prev => [...prev, newQuestion]);
    setSuccess('Question added successfully');
    setTimeout(() => setSuccess(null), 3000);
  }, []);

  const updateQuestion = useCallback((question: QuizFormData) => {
    setQuestions(prev => prev.map(q => q.id === question.id ? question : q));
    setSuccess('Question updated successfully');
    setTimeout(() => setSuccess(null), 3000);
  }, []);

  const deleteQuestion = useCallback((id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
    setSuccess('Question deleted successfully');
    setTimeout(() => setSuccess(null), 3000);
  }, []);

  const loadQuiz = useCallback(async () => {
    if (!courseId || !lessonId || !contentId || !quizId) {
      setError('Missing required parameters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const quiz = await quizApi.getQuizById(courseId, lessonId, contentId, quizId);
      const formData = convertQuizToFormDataArray(quiz);
      setQuestions(formData);
    } catch (err) {
      const error = err as Error & { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || error.message || 'Failed to load quiz data');
    } finally {
      setLoading(false);
    }
  }, [courseId, lessonId, contentId, quizId]);

  const saveQuiz = useCallback(async () => {
    if (!courseId || !lessonId || !contentId) {
      setError('Missing required parameters (courseId, lessonId, contentId)');
      return;
    }

    const validationError = validateQuizFormDataArray(questions);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const quizData: CreateQuizDto = {
        contentId,
        questions: convertQuizFormToDto(questions)
      };

      if (quizId) {
        // Update existing quiz
        await quizApi.updateQuiz(courseId, lessonId, contentId, quizId, { 
          questions: quizData.questions 
        });
        setSuccess('Quiz updated successfully!');
      } else {
        // Create new quiz
        await quizApi.createQuiz(courseId, lessonId, contentId, quizData);
        setSuccess('Quiz created successfully!');
      }
      
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      const error = err as Error & { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || error.message || 'Failed to save quiz');
    } finally {
      setSaving(false);
    }
  }, [courseId, lessonId, contentId, quizId, questions]);

  return {
    // State
    questions,
    loading,
    saving,
    error,
    success,
    
    // Actions
    setQuestions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    loadQuiz,
    saveQuiz,
    clearMessages,
  };
};