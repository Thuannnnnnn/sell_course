'use client';
import { useSearchParams } from "next/navigation";

const QuizzPage = () => {
  const searchParams = useSearchParams();
  const contentId = searchParams.get("contentId");

  return <div>Quizz Page for content ID: {contentId}</div>;
};

export default QuizzPage;
