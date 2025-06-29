'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import QuizPage from '../../../../../components/pages/QuizPage';

export default function QuizPageRoute() {
  const params = useParams();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;
  const contentId = params.contentId as string;
  const quizId = params.quizId as string;

  return (
    <div className="container mx-auto py-8">
      <QuizPage
        courseId={courseId}
        lessonId={lessonId}
        contentId={contentId}
        quizId={quizId}
        onComplete={(score, results) => {
          console.log('Quiz completed:', { score, results });
          // Có thể redirect hoặc show notification
        }}
      />
    </div>
  );
}