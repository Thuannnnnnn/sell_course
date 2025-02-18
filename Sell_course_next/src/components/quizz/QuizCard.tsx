import React from 'react';
import styles from "@/style/Quizz/QuizzesManagement.module.css";

interface QuizQuestion {
  questionId: string;
  question: string;
  answers: Array<{
    answerId: string;
    answer: string;
    isCorrect: boolean;
  }>;
}

interface QuizCardProps {
  title: string;
  question: QuizQuestion;
  onEdit: () => void;
  onDelete: () => void;
}

const QuizCard: React.FC<QuizCardProps> = ({
  title,
  question,
  onEdit,
  onDelete,
}) => {
  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>{title}</h2>
      {question.question ? (
        <h5 className={styles.cardQuestion}>{question.question}</h5>
      ) : (
        <p className={styles.noQuestion}>Không có câu hỏi!</p>
      )}
      <div className={styles.buttonContainer}>
        <button
          className={`${styles.button} ${styles.primary}`}
          onClick={onEdit}
        >
          Edit Quiz
        </button>
        <button
          className={`${styles.button} ${styles.secondary}`}
          onClick={onDelete}
        >
          Delete Quiz
        </button>
      </div>
    </div>
  );
};

export default QuizCard;