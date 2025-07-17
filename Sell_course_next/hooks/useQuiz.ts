'use client';

import { useState, useEffect, useCallback } from 'react';
import { quizAPI } from '../lib/api/quiz';
import { 
  Question, 
  Quiz, 
  QuizResult, 
  SubmitQuizRequest,
  AnswerSubmit 
} from '../app/types/Course/Lesson/content/quizz';

interface UseQuizProps {
  courseId: string;
  lessonId: string;
  contentId: string;
  quizId?: string;
}

interface QuizState {
  quiz: Quiz | null;
  questions: Question[];
  currentQuestionIndex: number;
  selectedAnswers: (string | null)[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  quizResult: QuizResult | null;
  isCompleted: boolean;
  timeLeft: number | null;
  quizStarted: boolean;
}

export const useQuiz = ({ courseId, lessonId, contentId, quizId }: UseQuizProps) => {
  const [state, setState] = useState<QuizState>({
    quiz: null,
    questions: [],
    currentQuestionIndex: 0,
    selectedAnswers: [],
    isLoading: false,
    isSubmitting: false,
    error: null,
    quizResult: null,
    isCompleted: false,
    timeLeft: null,
    quizStarted: false,
  });

  // Load quiz data
  const loadQuiz = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const quiz = quizId 
        ? await quizAPI.getQuiz(courseId, lessonId, contentId, quizId)
        : await quizAPI.getRandomQuiz(courseId, lessonId, contentId);

      const questions = quiz.questions;
      
      setState(prev => ({
        ...prev,
        quiz: quiz,
        questions,
        selectedAnswers: new Array(questions.length).fill(null),
        isLoading: false,
        timeLeft: 30 * 60, // 30 minutes
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load quiz',
        isLoading: false,
      }));
    }
  }, [courseId, lessonId, contentId, quizId]);

  // Start quiz
  const startQuiz = useCallback(() => {
    setState(prev => ({ ...prev, quizStarted: true }));
  }, []);

  // Select answer
  const selectAnswer = useCallback((questionIndex: number, answerId: string) => {
    setState(prev => {
      const newAnswers = [...prev.selectedAnswers];
      newAnswers[questionIndex] = answerId;
      return { ...prev, selectedAnswers: newAnswers };
    });
  }, []);

  // Navigate questions
  const goToQuestion = useCallback((index: number) => {
    setState(prev => ({ ...prev, currentQuestionIndex: index }));
  }, []);

  const nextQuestion = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentQuestionIndex: Math.min(prev.currentQuestionIndex + 1, prev.questions.length - 1)
    }));
  }, []);

  const previousQuestion = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentQuestionIndex: Math.max(prev.currentQuestionIndex - 1, 0)
    }));
  }, []);

  // Submit quiz
  const submitQuiz = useCallback(async () => {
    if (!state.quiz || !quizId) {
      setState(prev => ({ ...prev, error: 'Quiz data not available' }));
      return;
    }

    setState(prev => ({ ...prev, isSubmitting: true, error: null }));

    try {
      const answers: AnswerSubmit[] = state.selectedAnswers
        .map((answerId, index) => {
          if (!answerId) return null;
          return {
            questionId: state.questions[index].questionId,
            answerId: answerId,
          };
        })
        .filter((answer): answer is AnswerSubmit => answer !== null);

      const submitData: SubmitQuizRequest = {
        quizzId: state.quiz.quizzId,
        answers,
      };

      const response = await quizAPI.submitQuiz(
        courseId,
        lessonId,
        contentId,
        quizId,
        submitData
      );

      // response.data is QuizResult[], we need the first element
      const quizResult = response.data[0];

      setState(prev => ({
        ...prev,
        quizResult: quizResult,
        isCompleted: true,
        isSubmitting: false,
      }));

      return quizResult;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to submit quiz',
        isSubmitting: false,
      }));
    }
  }, [state.quiz, state.selectedAnswers, state.questions, courseId, lessonId, contentId, quizId]);

  // Reset quiz
  const resetQuiz = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentQuestionIndex: 0,
      selectedAnswers: new Array(prev.questions.length).fill(null),
      quizResult: null,
      isCompleted: false,
      timeLeft: 30 * 60,
      quizStarted: false,
      error: null,
    }));
  }, []);

  // Timer effect
  useEffect(() => {
    if (!state.quizStarted || state.timeLeft === null || state.timeLeft <= 0 || state.isCompleted) {
      return;
    }

    const timer = setInterval(() => {
      setState(prev => {
        if (prev.timeLeft && prev.timeLeft <= 1) {
          // Auto-submit when time runs out
          submitQuiz();
          return { ...prev, timeLeft: 0 };
        }
        return { ...prev, timeLeft: prev.timeLeft ? prev.timeLeft - 1 : 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state.quizStarted, state.timeLeft, state.isCompleted, submitQuiz]);

  // Load quiz on mount
  useEffect(() => {
    loadQuiz();
  }, [loadQuiz]);

  // Computed values
  const currentQuestion = state.questions[state.currentQuestionIndex] || null;
  const progress = state.questions.length > 0 
    ? ((state.currentQuestionIndex + 1) / state.questions.length) * 100 
    : 0;
  const answeredCount = state.selectedAnswers.filter(answer => answer !== null).length;
  const isLastQuestion = state.currentQuestionIndex === state.questions.length - 1;
  const canSubmit = answeredCount > 0;

  return {
    // State
    ...state,
    
    // Computed values
    currentQuestion,
    progress,
    answeredCount,
    isLastQuestion,
    canSubmit,
    
    // Actions
    loadQuiz,
    startQuiz,
    selectAnswer,
    goToQuestion,
    nextQuestion,
    previousQuestion,
    submitQuiz,
    resetQuiz,
  };
};

export default useQuiz;