import React from 'react';
import styles from "@/style/Quizz/QuizzesManagement.module.css";
import { CreateQuizzDto } from "@/app/type/quizz/quizz";

interface CreateQuizModalProps {
  showCreateModal: boolean;
  newQuizData: CreateQuizzDto;
  onAddQuestion: () => void;
  onDeleteQuestion: (questionIndex: number) => void;
  onQuestionChange: (questionIndex: number, value: string) => void;
  onAnswerChange: (questionIndex: number, answerIndex: number, value: string) => void;
  onCorrectAnswerChange: (questionIndex: number, answerIndex: number, checked: boolean) => void;
  onCreateQuiz: () => void;
  onClose: () => void;
}

const CreateQuizModal: React.FC<CreateQuizModalProps> = ({
  showCreateModal,
  newQuizData,
  onAddQuestion,
  onDeleteQuestion,
  onQuestionChange,
  onAnswerChange,
  onCorrectAnswerChange,
  onCreateQuiz,
  onClose,
}) => {
  if (!showCreateModal) return null;

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>Create New Quiz</h2>
        <button className={styles.addButton} onClick={onAddQuestion}>
          Add New Question
        </button>
        {newQuizData.questions.map((question, qIndex) => (
          <div key={qIndex} className={styles.questionSection}>
            <div className={styles.questionHeader}>
              <h3>Question {qIndex + 1}</h3>
              <button
                className={`${styles.button} ${styles.secondary}`}
                onClick={() => onDeleteQuestion(qIndex)}
              >
                Delete Question
              </button>
            </div>
            <input
              type="text"
              className={styles.inputText}
              placeholder="Enter question"
              value={question.question}
              onChange={(e) => onQuestionChange(qIndex, e.target.value)}
            />
            {question.answers.map((answer, aIndex) => (
              <div key={aIndex} className={styles.answerRow}>
                <input
                  type="text"
                  className={styles.inputText}
                  placeholder={`Answer ${aIndex + 1}`}
                  value={answer.answer}
                  onChange={(e) => onAnswerChange(qIndex, aIndex, e.target.value)}
                />
                <input
                  title="checkbox"
                  type="checkbox"
                  className={styles.inputCheckbox}
                  checked={answer.isCorrect}
                  onChange={(e) => onCorrectAnswerChange(qIndex, aIndex, e.target.checked)}
                />
                <label>Correct</label>
              </div>
            ))}
          </div>
        ))}
        <div className={styles.modalButtons}>
          <button
            className={`${styles.button} ${styles.primary}`}
            onClick={onCreateQuiz}
          >
            Create Quiz
          </button>
          <button
            className={`${styles.button} ${styles.secondary}`}
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateQuizModal;