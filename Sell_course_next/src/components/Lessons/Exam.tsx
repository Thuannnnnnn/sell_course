"use client";
import { useState } from "react";

interface ExamLessonProps {
  title: string;
  questions: { question: string; options: string[]; correct: number }[];
  onComplete: () => void;
}

export default function ExamLesson({ title, questions, onComplete }: ExamLessonProps) {
  const [score, setScore] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(new Array(questions.length).fill(-1));

  const handleAnswer = (index: number, answer: number) => {
    const updatedAnswers = [...selectedAnswers];
    updatedAnswers[index] = answer;
    setSelectedAnswers(updatedAnswers);
  };

  const handleSubmit = () => {
    if (selectedAnswers.every((ans) => ans !== -1)) {
      const correctAnswers = questions.filter((q, i) => selectedAnswers[i] === q.correct).length;
      setScore(correctAnswers);
      onComplete();
    }
  };

  return (
    <div className="lesson-container">
      <h2>{title}</h2>
      {questions.map((q, index) => (
        <div key={index} className="exam-question">
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
      <button onClick={handleSubmit}>Submit Exam</button>
      {score !== null && <p>Score: {score}/{questions.length}</p>}
    </div>
  );
}
