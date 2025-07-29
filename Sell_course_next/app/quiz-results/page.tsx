"use client";

import React from "react";
import QuizResultsList from "../../components/course/QuizResultsList";

export default function QuizResultsPage() {
  return (
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Quiz Results</h1>
          <p className="text-muted-foreground">
            Track your quiz performance and progress across all courses.
          </p>
        </div>

        <QuizResultsList />
      </div>
  );
}
