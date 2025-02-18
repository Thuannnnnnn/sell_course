import axios from 'axios';

export interface CreateQuizzDto {
  contentId: string;
  questions: {
    question: string;
    answers: {
      answer: string;
      isCorrect: boolean;
    }[];
  }[];
}

export interface UpdateQuizzDto {
  quizzId: string;
  questions: {
    questionId: string;
    question: string;
    answers: {
      answerId: string;
      answer: string;
      isCorrect: boolean;
    }[];
  }[];
}

export const createQuizz = async (createQuizzDto: CreateQuizzDto) => {
  try {
    console.log('Creating quiz with data:', createQuizzDto);
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quizz/create`,
      createQuizzDto
    );
    console.log('Quiz created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating quiz:', error);
    throw error;
  }
};

export const getQuizzesByContentId = async (contentId: string) => {
  try {
    console.log('Fetching quizzes for contentId:', contentId);
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quizz/content/${contentId}`
    );
    console.log('Quizzes data received:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    console.log(
      'API URL used:',
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quizz/content/${contentId}`
    );
    throw error;
  }
};

export const updateQuizz = async (updateQuizzDto: UpdateQuizzDto) => {
  try {
    const { quizzId, ...quizzData } = updateQuizzDto;
    console.log('Updating quiz with ID:', quizzId, 'Data:', quizzData);
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quizz/update/${quizzId}`,
      quizzData
    );
    console.log('Quiz updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating quiz:', error);
    throw error;
  }
};

export const getQuizzById = async (quizzId: string) => {
  try {
    console.log('Fetching quiz with ID:', quizzId);
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quizz/${quizzId}`
    );
    console.log('Quiz data received:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching quiz:', error);
    throw error;
  }
};
