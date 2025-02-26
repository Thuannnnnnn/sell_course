"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import QuizPage from "@/components/quizz/Quiz";

export default function QuizzPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const contentId = params.contentId as string;
  const quizId = searchParams.get("quizzId") || undefined;
  const lessonId = searchParams.get("lessonId") as string;

  const handleComplete = (lessonId: string) => {
    router.push(`/lesson/${lessonId}`);
  };

  if (!lessonId) {
    return <div>Error: Lesson ID is required</div>;
  }

  return (
    <QuizPage
      contentId={contentId}
      quizzId={quizId}
      lessonId={lessonId}
      onComplete={handleComplete}
    />
  );
}
