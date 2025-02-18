import React from 'react';
import styles from "@/style/Quizz/QuizzesManagement.module.css";

interface EditingQuestion {
  quizzId: string;
  questionId: string;
  question: string;
  answers: { anwserId: string; answer: string; isCorrect: boolean }[];
}

interface EditQuestionModalProps {
  showEditModal: boolean;
  editingQuestion: EditingQuestion | null;
  onQuestionChange: (value: string) => void;
  onAnswerChange: (answerIndex: number, value: string) => void;
  onCorrectAnswerChange: (answerIndex: number, checked: boolean) => void;
  onUpdate: () => void;
  onClose: () => void;
}

const EditQuestionModal: React.FC<EditQuestionModalProps> = ({
  showEditModal,
  editingQuestion,
  onQuestionChange,
  onAnswerChange,
  onCorrectAnswerChange,
  onUpdate,
  onClose,
}) => {
  if (!showEditModal || !editingQuestion) return null;

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>Edit Question</h2>
        <div className={styles.questionSection}>
          <input
            type="text"
            className={styles.inputText}
            placeholder="Enter question"
            value={editingQuestion.question}
            onChange={(e) => onQuestionChange(e.target.value)}
          />
          {editingQuestion.answers.map((answer, aIndex) => (
            <div key={aIndex} className={styles.answerRow}>
              <input
                type="text"
                className={styles.inputText}
                placeholder={`Answer ${aIndex + 1}`}
                value={answer.answer}
                onChange={(e) => onAnswerChange(aIndex, e.target.value)}
              />
              <input
                type="checkbox"
                className={styles.inputCheckbox}
                checked={answer.isCorrect}
                onChange={(e) => onCorrectAnswerChange(aIndex, e.target.checked)}
              />
              <label>Correct</label>
            </div>
          ))}
        </div>
        <div className={styles.modalButtons}>
          <button
            className={`${styles.button} ${styles.primary}`}
            onClick={onUpdate}
          >
            Update Question
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

export default EditQuestionModal;