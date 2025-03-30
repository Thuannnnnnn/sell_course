import { UserAnswerPayload } from "@/app/type/UserAnswer/UUserAnswer";
import axios from "axios";

export const submitUserAnswer = async (payload: UserAnswerPayload) => {
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user-answers`, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch {
    throw new Error("Failed to submit answer");
  }
};

export const fetchUserAnswers = async () => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/user-answers`
    );
    return response.data;
  } catch {
    throw new Error("Failed to fetch user answers");
  }
};

export const fetchUserAnswersByUserId = async (userId: string) => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/user-answers/${userId}`
  );
  return response.data; // an array of answers
};