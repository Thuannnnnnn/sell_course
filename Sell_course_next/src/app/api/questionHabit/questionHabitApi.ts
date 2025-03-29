import { QuestionHabit } from "@/app/type/question/question";

const API_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/question-habits`;

export const fetchQuestionHabits = async (): Promise<QuestionHabit[]> => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Lỗi khi lấy danh sách câu hỏi");
    }
    return await response.json();
  } catch (error) {
    console.error("Lỗi khi lấy danh sách câu hỏi:", error);
    return [];
  }
};

export const getQuestionHabitById = async (
  id: string
): Promise<QuestionHabit | null> => {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) {
      throw new Error("Lỗi khi lấy câu hỏi");
    }
    return await response.json();
  } catch (error) {
    console.error("Lỗi khi lấy câu hỏi:", error);
    return null;
  }
};

export const createQuestionHabit = async (
  data: QuestionHabit
): Promise<QuestionHabit | null> => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("Lỗi khi tạo câu hỏi");
    }
    return await response.json();
  } catch (error) {
    console.error("Lỗi khi tạo câu hỏi:", error);
    return null;
  }
};

export const updateQuestionHabit = async (
  id: string,
  data: QuestionHabit
): Promise<QuestionHabit | null> => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("Lỗi khi cập nhật câu hỏi");
    }
    return await response.json();
  } catch (error) {
    console.error("Lỗi khi cập nhật câu hỏi:", error);
    return null;
  }
};

export const deleteQuestionHabit = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!response.ok) {
      throw new Error("Lỗi khi xóa câu hỏi");
    }
    return true;
  } catch (error) {
    console.error("Lỗi khi xóa câu hỏi:", error);
    return false;
  }
};
