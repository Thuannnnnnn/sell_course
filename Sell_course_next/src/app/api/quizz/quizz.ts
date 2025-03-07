import { CreateQuizzDto, UpdateQuizzDto } from "@/app/type/quizz/quizz";
import axios, { AxiosError } from "axios";
import { QuizSubmissionData } from "@/app/type/quizz/quizz";
const handleAxiosError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;
    if (axiosError.response?.data && "message" in axiosError.response.data) {
      throw new Error(axiosError.response.data.message);
    }
    if (axiosError.response) {
      throw new Error(
        `Request failed with status ${axiosError.response.status}`
      );
    }
    if (axiosError.request) {
      throw new Error("No response received from server");
    }
  }
  throw error;
};

export const createQuizz = async (createQuizzDto: CreateQuizzDto) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/quizz/create`,
      createQuizzDto
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const getQuizzesByContentId = async (contentId: string) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/quizz/content/${contentId}`
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error);
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
    handleAxiosError(error);
  }
};

export const getQuizzById = async (quizzId: string) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/quizz/${quizzId}`
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error);
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
    handleAxiosError(error);
  }
};

export const getRandomQuiz = async (contentId: string, quizId?: string) => {
  try {
    const queryParams = new URLSearchParams();

    if (quizId) {
      queryParams.append("quizzId", quizId);
    }

    const response = await axios.get(
      `${
        process.env.NEXT_PUBLIC_BACKEND_URL
      }/api/quizz/random/${contentId}?${queryParams.toString()}`
    );

    console.log("data day ne", response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message;

      switch (status) {
        case 404:
          throw new Error("No quiz found for this content");
        case 400:
          throw new Error(message || "Invalid quiz request");
        default:
          if (error.response) {
            throw new Error(message || `Error fetching quiz: ${status}`);
          }
          if (error.request) {
            throw new Error(
              "No response received from server. Please check your connection and try again."
            );
          }
      }
    }
    console.error("Error fetching random quiz:", error);
    throw new Error("Failed to load quiz. Please try again.");
  }
};

export const submitQuizAnswers = async (
  data: QuizSubmissionData,
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

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quizzStore/submit`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message;

      switch (status) {
        case 500:
          throw new Error(
            message ||
              "Internal server error occurred. Please try again later or contact support if the issue persists."
          );
        case 400:
          throw new Error(
            message ||
              "Invalid quiz submission data. Please check your answers and try again."
          );
        default:
          if (error.response) {
            throw new Error(
              message || `Error submitting quiz answers: ${status}`
            );
          }
          if (error.request) {
            throw new Error(
              "No response received from server. Please check your connection and try again."
            );
          }
      }
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Failed to submit quiz answers. Please try again.");
  }
};

export const getQuizzResults = async (
  token: string,
  contentId: string,
  quizzId: string
) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quizzStore/results/${contentId}/${quizzId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message;

      switch (status) {
        case 404:
          throw new Error("Quiz results not found");
        case 401:
          throw new Error("Unauthorized access to quiz results");
        default:
          if (error.response) {
            throw new Error(
              message || `Error fetching quiz results: ${status}`
            );
          }
          if (error.request) {
            throw new Error(
              "No response received from server. Please check your connection and try again."
            );
          }
      }
    }

    throw error;
  }
};
