"use client";
import { AiOutlineFileText } from "react-icons/ai";

interface DocumentLessonProps {
  title: string;
  content: string;
  onComplete: () => void;
}

export default function DocumentLesson({ title, content, onComplete }: DocumentLessonProps) {
  return (
    <div className="lesson-container">
      <h2>{title}</h2>
      <div className="doc-content">
        <AiOutlineFileText className="doc-icon" />
        <p>{content}</p>
      </div>
      <button onClick={onComplete}>Mark as Read</button>
    </div>
  );
}
