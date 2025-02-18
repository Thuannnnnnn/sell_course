import { CreateQuizzDto, UpdateQuizzDto } from "@/app/type/quizz/quizz";
import axios from "axios";

export const createQuizz = async (createQuizzDto: CreateQuizzDto) => {
  try {
    console.log("Creating quiz with data:", createQuizzDto);
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/quizz/create`,
      createQuizzDto
    );
    return response.data;
  } catch (error) {
    console.error("Error creating quiz:", error);
    throw error;
  }
};

export const getQuizzesByContentId = async (contentId: string) => {
  try {
    console.log("Fetching quizzes for contentId:", contentId);
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/quizz/content/${contentId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateQuizz = async (updateQuizzDto: UpdateQuizzDto) => {
  try {
    const { quizzId, ...quizzData } = updateQuizzDto;
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/quizz/update/${quizzId}`,
      quizzData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating quiz:", error);
    throw error;
  }
};

export const getQuizzById = async (quizzId: string) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/quizz/${quizzId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching quiz:", error);
    throw error;
  }
};
export const deleteQuizzByQuestionId = async (
  quizzId: string,
  questionId: string
) => {
  try {
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/quizz/${quizzId}/question/${questionId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting question:", error);
    throw error;
  }
};
