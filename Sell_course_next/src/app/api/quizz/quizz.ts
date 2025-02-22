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

export const getRandomQuiz = async (quizzId: string) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quizz/random/${quizzId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching random quiz:", error);
    throw error;
  }
};

export const submitQuizAnswers = async (
  data: {
    userId: string;
    answers: Array<{ questionId: string; answerId: string }>;
    quizzId?: string;
  },
  token: string
) => {
  try {
    if (!token) {
      throw new Error("Authentication token is required");
    }
    if (!data.userId) {
      throw new Error("userId is required");
    }
    if (!Array.isArray(data.answers) || data.answers.length === 0) {
      throw new Error("answers array is required and cannot be empty");
    }

    for (const answer of data.answers) {
      if (!answer.questionId || !answer.answerId) {
        throw new Error("Each answer must have both questionId and answerId");
      }
    }

    console.log("Submitting quiz answers with payload:", JSON.stringify(data, null, 2));

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quizzStore/submit`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("Quiz submission successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error submitting quiz answers. Full error:", error);
    console.error("Submission payload:", JSON.stringify(data, null, 2));

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 500) {
        console.error("Server error details:", error.response.data);
        throw new Error(
          error.response.data.message ||
          "Internal server error occurred. Please try again later or contact support if the issue persists."
        );
      }
      if (error.response?.status === 400) {
        throw new Error(
          error.response.data.message ||
          "Invalid quiz submission data. Please check your answers and try again."
        );
      }
      if (error.response) {
        throw new Error(
          error.response.data.message ||
          `Error submitting quiz answers: ${error.response.status}`
        );
      }
      if (error.request) {
        throw new Error(
          "No response received from server. Please check your connection and try again."
        );
      }
    }

    if (error instanceof Error && error.message) {
      throw error;
    }

    throw new Error("Failed to submit quiz answers. Please try again.");
  }
};
