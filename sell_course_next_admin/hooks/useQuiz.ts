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
  newQuizId: string | null;
  
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
  const [newQuizId, setNewQuizId] = useState<string | null>(null);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
    setNewQuizId(null);
  }, []);

  const addQuestion = useCallback((question: QuizFormData) => {
    const newQuestion = { ...question, id: Math.random().toString(36).substr(2, 9) };
    console.log('➕ addQuestion called:', { original: question, withId: newQuestion });
    setQuestions(prev => {
      const newQuestions = [...prev, newQuestion];
      console.log('📝 Questions after add:', newQuestions);
      return newQuestions;
    });
    setSuccess('Question added successfully');
    setTimeout(() => setSuccess(null), 3000);
  }, []);

  const updateQuestion = useCallback((question: QuizFormData) => {
    console.log('✏️ updateQuestion called:', question);
    setQuestions(prev => {
      const newQuestions = prev.map(q => q.id === question.id ? question : q);
      console.log('📝 Questions after update:', newQuestions);
      return newQuestions;
    });
    setSuccess('Question updated successfully');
    setTimeout(() => setSuccess(null), 3000);
  }, []);

  const deleteQuestion = useCallback((id: string) => {
    console.log('🗑️ deleteQuestion called:', { 
      id, 
      currentQuestionsCount: questions.length,
      currentQuestions: questions.map(q => ({ id: q.id, question: q.question }))
    });
    setQuestions(prev => {
      const newQuestions = prev.filter(q => q.id !== id);
      console.log('🗑️ After delete:', { 
        deletedId: id,
        oldCount: prev.length, 
        newCount: newQuestions.length,
        remainingQuestions: newQuestions.map(q => ({ id: q.id, question: q.question }))
      });
      return newQuestions;
    });
    setSuccess('Question deleted successfully');
    setTimeout(() => setSuccess(null), 3000);
  }, [questions]);

  const loadQuiz = useCallback(async () => {

    
    if (!courseId || !lessonId || !contentId || !quizId) {

      setError('Missing required parameters for loading quiz');
      return;
    }


    setLoading(true);
    setError(null);

    try {
      const quiz = await quizApi.getQuizById(courseId, lessonId, contentId, quizId);

      
      const formData = convertQuizToFormDataArray(quiz);

      
      setQuestions(formData);

      setSuccess('Quiz loaded successfully');
      setTimeout(() => setSuccess(null), 3000);
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

    if (questions.length === 0) {
      setError('Please add at least one question before saving');
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
      const convertedQuestions = convertQuizFormToDto(questions);
      const quizData: CreateQuizDto = {
        contentId,
        questions: convertedQuestions
      };



      if (quizId) {
        // Update existing quiz

        const updateResult = await quizApi.updateQuiz(courseId, lessonId, contentId, quizId, { 
          questions: quizData.questions 
        });

        setSuccess('Quiz updated successfully!');
      } else {
        // Create new quiz

        const newQuiz = await quizApi.createQuiz(courseId, lessonId, contentId, quizData);
        setSuccess('Quiz created successfully!');
        setNewQuizId(newQuiz.quizzId);

      }
      
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      const error = err as Error & { response?: { data?: { message?: string } } };
      console.error('Save quiz error:', error);
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
    newQuizId,
    
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