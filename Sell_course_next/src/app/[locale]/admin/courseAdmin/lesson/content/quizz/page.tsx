"use client";
import QuizzesManagement from "@/components/quizz/QuizzManagement";
import { useSearchParams } from "next/navigation";

const QuizzPage = () => {
  const searchParams = useSearchParams();
  const contentId = searchParams.get("contentId");

  return <QuizzesManagement />;
};

export default QuizzPage;
