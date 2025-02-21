import React from "react";
import styles from "@/style/Quizz/QuizzesManagement.module.css";
import { Question, Quiz } from "@/app/type/quizz/quizz";
import QuizCard from "./QuizCard";

interface QuizListProps {
  loading: boolean;
  quizzes: Quiz[];
  onEditQuestion: (quizzId: string, question: Question) => void;
  onDeleteQuestion: (quizzId: string, questionId: string) => void;
}

const QuizList: React.FC<QuizListProps> = ({
  loading,
  quizzes,
  onEditQuestion,
  onDeleteQuestion,
}) => {
  if (loading) {
    return <p className={styles.loading}>Đang tải dữ liệu...</p>;
  }

  if (quizzes.length === 0) {
    return <p className={styles.noData}>Không có quiz nào!</p>;
  }

  return (
    <>
      {quizzes.map((quiz) => {
        if (!quiz?.quizzId) {
          return null;
        }
        return (
          <div key={quiz.quizzId}>
            {quiz.questions.map((question, idx) => (
              <QuizCard
                key={`${quiz.quizzId}-question-${question.questionId || idx}`}
                title={`Câu hỏi ${idx + 1}`}
                question={question}
                onEdit={() => onEditQuestion(quiz.quizzId, question)}
                onDelete={() =>
                  onDeleteQuestion(quiz.quizzId, question.questionId)
                }
              />
            ))}
          </div>
        );
      })}
    </>
  );
};

export default QuizList;
