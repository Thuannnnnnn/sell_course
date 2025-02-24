"use client";

import { useParams, useSearchParams } from "next/navigation";
import QuizPage from "@/components/quizz/Quiz";

export default function QuizzPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const contentId = params.contentId as string;
  const quizId = searchParams.get("quizzId") || undefined;

  return <QuizPage contentId={contentId} quizzId={quizId} />;
}
