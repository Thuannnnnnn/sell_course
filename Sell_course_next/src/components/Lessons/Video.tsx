"use client";
import { FaPlay } from "react-icons/fa";

interface VideoLessonProps {
  title: string;
  duration: string;
  onComplete: () => void;
}

export default function VideoLesson({ title, duration, onComplete }: VideoLessonProps) {
  return (
    <div className="lesson-container">
      <h2>{title}</h2>
      <div className="video-player">
        <FaPlay className="video-play-icon" onClick={onComplete} />
      </div>
      <p>Duration: {duration}</p>
    </div>
  );
}
