import { Question } from "@/app/type/quizz/quizz";

export const fetchQuestions = async (): Promise<Question[]> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/question-habits`);
    if (!response.ok) {
      throw new Error("Lỗi khi lấy dữ liệu từ API");
    }
    const data: Question[] = await response.json();
    return data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách câu hỏi:", error);
    return [];
  }
};
