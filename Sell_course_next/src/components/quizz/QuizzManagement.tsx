"use client";

import React, { useState, useEffect } from "react";
import styles from "@/style/Quizz/QuizzesManagement.module.css";
import {
  getQuizzesByContentId,
  createQuizz,
  CreateQuizzDto,
  updateQuizz,
  getQuizzById,
} from "@/app/api/quizz/quizz";
import { useSearchParams } from "next/navigation";

const QuizzesManagement = () => {
  const searchParams = useSearchParams();
  const contentId = searchParams.get("contentId");
  interface Answer {
    answerId: string;
    answer: string;
    isCorrect: boolean;
  }

  interface Question {
    questionId: string;
    question: string;
    answers: Answer[];
  }

  interface Quiz {
    quizzId: string;
    contentId: string;
    questions: Question[];
  }

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<{
    quizzId: string;
    questionId: string;
    question: string;
    answers: { anwserId: string; answer: string; isCorrect: boolean }[];
  } | null>(null);
  const [newQuizData, setNewQuizData] = useState<CreateQuizzDto>({
    contentId: contentId || "",
    questions: [
      {
        question: "",
        answers: [
          { answer: "", isCorrect: false },
          { answer: "", isCorrect: false },
          { answer: "", isCorrect: false },
          { answer: "", isCorrect: false },
        ],
      },
    ],
  });

  const handleDeleteQuestion = (qIndex: number) => {
    if (newQuizData.questions.length <= 1) {
      alert("Quiz must have at least one question!");
      return;
    }
    const updatedQuestions = newQuizData.questions.filter(
      (_, index) => index !== qIndex
    );
    setNewQuizData({
      ...newQuizData,
      questions: updatedQuestions,
    });
  };

  const handleAddQuestion = () => {
    setNewQuizData({
      ...newQuizData,
      questions: [
        ...newQuizData.questions,
        {
          question: "",
          answers: [
            { answer: "", isCorrect: false },
            { answer: "", isCorrect: false },
            { answer: "", isCorrect: false },
            { answer: "", isCorrect: false },
          ],
        },
      ],
    });
  };

  const handleEditQuestion = async (
    quizzId: string | undefined,
    question: Question
  ) => {
    if (!quizzId) {
      alert("Cannot edit question: Quiz ID is missing");
      return;
    }

    if (!question?.questionId) {
      alert("Cannot edit question: Question ID is missing");
      return;
    }

    try {
      setLoading(true);
      const quizData = await getQuizzById(quizzId);

      const targetQuestion = quizData.questions.find(
        (q: Question) => q.questionId === question.questionId
      );

      if (!targetQuestion) {
        throw new Error("Question not found in quiz");
      }

      setEditingQuestion({
        quizzId: quizzId,
        questionId: question.questionId,
        question: targetQuestion.question || "",
        answers: targetQuestion.answers.map((a: Answer) => ({
          anwserId: a.answerId,
          answer: a.answer || "",
          isCorrect: Boolean(a.isCorrect),
        })),
      });

      setShowEditModal(true);
    } catch (error) {
      alert("Failed to load question details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return;

    if (!editingQuestion.quizzId || !editingQuestion.questionId) {
      alert("Missing required IDs for update");
      return;
    }

    try {
      setLoading(true);
      await updateQuizz({
        quizzId: editingQuestion.quizzId,
        questions: [
          {
            questionId: editingQuestion.questionId,
            question: editingQuestion.question,
            answers: editingQuestion.answers.map((answer) => ({
              answerId: answer.anwserId,
              answer: answer.answer,
              isCorrect: answer.isCorrect,
            })),
          },
        ],
      });

      if (contentId) {
        const data = await getQuizzesByContentId(contentId);
        setQuizzes(Array.isArray(data) ? data : []);
      }

      setShowEditModal(false);
      setEditingQuestion(null);
    } catch (error) {
      alert(
        "Failed to update question. Please ensure all fields are filled correctly."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = async () => {
    if (!contentId) return;
    try {
      setLoading(true);
      await createQuizz(newQuizData);
      // Refresh quizzes list
      const data = await getQuizzesByContentId(contentId);
      setQuizzes(Array.isArray(data) ? data : []);
      setShowCreateModal(false);
      // Reset form
      setNewQuizData({
        contentId: contentId,
        questions: [
          {
            question: "",
            answers: [
              { answer: "", isCorrect: false },
              { answer: "", isCorrect: false },
              { answer: "", isCorrect: false },
              { answer: "", isCorrect: false },
            ],
          },
        ],
      });
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!contentId) return;

    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const data = await getQuizzesByContentId(contentId);

        setQuizzes(Array.isArray(data) ? data : []);
      } catch (error) {
        setQuizzes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [contentId]);

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <h1 className={styles.title}>Quizzes Management</h1>
          <button
            className={`${styles.button} ${styles.primary}`}
            onClick={() => setShowCreateModal(true)}
          >
            Add New Quiz
          </button>
        </div>

        {showCreateModal && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h2>Create New Quiz</h2>
              <button className={styles.addButton} onClick={handleAddQuestion}>
                Add New Question
              </button>
              {newQuizData.questions.map((question, qIndex) => (
                <div key={qIndex} className={styles.questionSection}>
                  <div className={styles.questionHeader}>
                    <h3>Question {qIndex + 1}</h3>
                    <button
                      className={`${styles.button} ${styles.secondary}`}
                      onClick={() => handleDeleteQuestion(qIndex)}
                    >
                      Delete Question
                    </button>
                  </div>
                  <input
                    type="text"
                    className={styles.inputText}
                    placeholder="Enter question"
                    value={question.question}
                    onChange={(e) => {
                      const updatedQuestions = [...newQuizData.questions];
                      updatedQuestions[qIndex].question = e.target.value;
                      setNewQuizData({
                        ...newQuizData,
                        questions: updatedQuestions,
                      });
                    }}
                  />
                  {question.answers.map((answer, aIndex) => (
                    <div key={aIndex} className={styles.answerRow}>
                      <input
                        type="text"
                        className={styles.inputText}
                        placeholder={`Answer ${aIndex + 1}`}
                        value={answer.answer}
                        onChange={(e) => {
                          const updatedQuestions = [...newQuizData.questions];
                          updatedQuestions[qIndex].answers[aIndex].answer =
                            e.target.value;
                          setNewQuizData({
                            ...newQuizData,
                            questions: updatedQuestions,
                          });
                        }}
                      />
                      <input
                        type="checkbox"
                        className={styles.inputCheckbox}
                        checked={answer.isCorrect}
                        onChange={(e) => {
                          const updatedQuestions = [...newQuizData.questions];
                          updatedQuestions[qIndex].answers[aIndex].isCorrect =
                            e.target.checked;
                          setNewQuizData({
                            ...newQuizData,
                            questions: updatedQuestions,
                          });
                        }}
                      />
                      <label>Correct</label>
                    </div>
                  ))}
                </div>
              ))}
              <div className={styles.modalButtons}>
                <button
                  className={`${styles.button} ${styles.primary}`}
                  onClick={handleCreateQuiz}
                >
                  Create Quiz
                </button>
                <button
                  className={`${styles.button} ${styles.secondary}`}
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showEditModal && editingQuestion && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h2>Edit Question</h2>
              <div className={styles.questionSection}>
                <input
                  type="text"
                  className={styles.inputText}
                  placeholder="Enter question"
                  value={editingQuestion.question}
                  onChange={(e) => {
                    setEditingQuestion({
                      ...editingQuestion,
                      question: e.target.value,
                    });
                  }}
                />
                {editingQuestion.answers.map((answer, aIndex) => (
                  <div key={aIndex} className={styles.answerRow}>
                    <input
                      type="text"
                      className={styles.inputText}
                      placeholder={`Answer ${aIndex + 1}`}
                      value={answer.answer}
                      onChange={(e) => {
                        const updatedAnswers = [...editingQuestion.answers];
                        updatedAnswers[aIndex].answer = e.target.value;
                        setEditingQuestion({
                          ...editingQuestion,
                          answers: updatedAnswers,
                        });
                      }}
                    />
                    <input
                      type="checkbox"
                      className={styles.inputCheckbox}
                      checked={answer.isCorrect}
                      onChange={(e) => {
                        const updatedAnswers = [...editingQuestion.answers];
                        updatedAnswers[aIndex].isCorrect = e.target.checked;
                        setEditingQuestion({
                          ...editingQuestion,
                          answers: updatedAnswers,
                        });
                      }}
                    />
                    <label>Correct</label>
                  </div>
                ))}
              </div>
              <div className={styles.modalButtons}>
                <button
                  className={`${styles.button} ${styles.primary}`}
                  onClick={handleUpdateQuestion}
                >
                  Update Question
                </button>
                <button
                  className={`${styles.button} ${styles.secondary}`}
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingQuestion(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hiển thị loading */}
        {loading ? (
          <p className={styles.loading}>Đang tải dữ liệu...</p>
        ) : quizzes.length === 0 ? (
          <p className={styles.noData}>Không có quiz nào!</p>
        ) : (
          quizzes.map((quiz) => {
            if (!quiz?.quizzId) {
              return null;
            }
            return (
              <div key={quiz.quizzId}>
                <h2 className={styles.quizTitle}>
                  Quiz {quiz.quizzId.slice(0, 8)}
                </h2>
                {quiz.questions.map((question, idx) => (
                  <QuizCard
                    key={`${quiz.quizzId}-question-${
                      question.questionId || idx
                    }`}
                    title={`Câu hỏi ${idx + 1}`}
                    question={question}
                    onEdit={() => handleEditQuestion(quiz.quizzId, question)}
                  />
                ))}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// Component hiển thị câu hỏi của quiz
interface QuizQuestion {
  questionId: string;
  question: string;
  answers: Array<{
    answerId: string;
    answer: string;
    isCorrect: boolean;
  }>;
}

const QuizCard = ({
  title,
  question,
  onEdit,
}: {
  title: string;
  question: QuizQuestion;
  onEdit: () => void;
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
        <button className={`${styles.button} ${styles.secondary}`}>
          Delete Quiz
        </button>
      </div>
    </div>
  );
};

export default QuizzesManagement;
