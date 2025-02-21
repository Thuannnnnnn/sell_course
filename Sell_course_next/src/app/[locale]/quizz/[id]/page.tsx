"use client";

import { useParams } from "next/navigation";
import QuizzRandom from "@/components/quizz/QuizzRandom";

export default function QuizzPage() {
  const params = useParams();
  const id = params.id as string;

  return <QuizzRandom quizId={id} />;
}
