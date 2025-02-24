"use client";

import { useParams } from "next/navigation";
import QuizPage from "@/components/quizz/Quiz";

export default function QuizzPage() {
  const params = useParams();
  const id = params.id as string;

  return <QuizPage quizzId={id} />;
}
