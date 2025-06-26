import { QuizFormData, CreateQuestionDto, CreateAnswerDto, Question, Quiz } from '../app/types/quiz';

// Convert frontend quiz form data to backend DTO
export const convertQuizFormToDto = (quizFormData: QuizFormData[]): CreateQuestionDto[] => {
  return quizFormData.map((quiz) => ({
    question: quiz.question,
    difficulty: quiz.difficulty || 'medium',
    weight: quiz.weight || 1,
    answers: quiz.options.map((option, index): CreateAnswerDto => ({
      answer: option,
      isCorrect: index === quiz.correctAnswer,
    })),
  }));
};

// Convert backend question data to frontend form data
export const convertQuestionToFormData = (question: Question): QuizFormData => {
  const correctAnswerIndex = question.answers.findIndex(answer => answer.isCorrect);
  
  return {
    id: question.questionId,
    question: question.question,
    options: question.answers.map(answer => answer.answer),
    correctAnswer: correctAnswerIndex >= 0 ? correctAnswerIndex : 0,
    difficulty: question.difficulty,
    weight: question.weight,
  };
};

// Convert backend quiz data to frontend form data array
export const convertQuizToFormDataArray = (quiz: Quiz): QuizFormData[] => {
  return quiz.questions.map(convertQuestionToFormData);
};

// Generate unique ID for new questions
export const generateQuestionId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Validate quiz form data
export const validateQuizFormData = (quizData: QuizFormData): string | null => {
  if (!quizData.question.trim()) {
    return 'Question text is required';
  }
  
  if (quizData.options.some(option => !option.trim())) {
    return 'All answer options must be filled';
  }
  
  if (quizData.options.length < 2) {
    return 'At least 2 answer options are required';
  }
  
  if (quizData.correctAnswer < 0 || quizData.correctAnswer >= quizData.options.length) {
    return 'Please select a correct answer';
  }
  
  return null;
};

// Validate array of quiz form data
export const validateQuizFormDataArray = (quizDataArray: QuizFormData[]): string | null => {
  if (quizDataArray.length === 0) {
    return 'At least one question is required';
  }
  
  for (let i = 0; i < quizDataArray.length; i++) {
    const error = validateQuizFormData(quizDataArray[i]);
    if (error) {
      return `Question ${i + 1}: ${error}`;
    }
  }
  
  return null;
};

// Format difficulty for display
export const formatDifficulty = (difficulty: 'easy' | 'medium' | 'hard'): string => {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
};

// Get difficulty color for UI
export const getDifficultyColor = (difficulty: 'easy' | 'medium' | 'hard'): string => {
  switch (difficulty) {
    case 'easy':
      return 'text-green-600 bg-green-100';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100';
    case 'hard':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};