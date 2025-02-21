"use client";
import { useState } from "react";

interface QuizLessonProps {
  title: string;
  questions: { question: string; options: string[]; correct: number }[];
  onComplete: () => void;
}

export default function QuizLesson({ title, questions, onComplete }: QuizLessonProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
  const [completed, setCompleted] = useState(false);

  const handleAnswer = (index: number, answer: number) => {
    const updatedAnswers = [...selectedAnswers];
    updatedAnswers[index] = answer;
    setSelectedAnswers(updatedAnswers);
  };

  const handleSubmit = () => {
    if (selectedAnswers.every((ans) => ans !== -1)) {
      setCompleted(true);
      onComplete();
    }
  };

  return (
    <div className="lesson-container">
      <h2>{title}</h2>
      {questions.map((q, index) => (
        <div key={index} className="quiz-question">
          <p>{q.question}</p>
          {q.options.map((option, i) => (
            <button
              key={i}
              className={selectedAnswers[index] === i ? "selected" : ""}
              onClick={() => handleAnswer(index, i)}
            >
              {option}
            </button>
          ))}
        </div>
      ))}
      <button onClick={handleSubmit} disabled={completed}>Submit Quiz</button>
    </div>
  );
}
