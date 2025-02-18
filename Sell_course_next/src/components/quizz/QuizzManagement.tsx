"use client";

import React, { useState, useEffect } from "react";
import styles from "@/style/Quizz/QuizzesManagement.module.css";
import {
  getQuizzesByContentId,
  createQuizz,
  updateQuizz,
  getQuizzById,
  deleteQuizzByQuestionId,
} from "@/app/api/quizz/quizz";
import { useSearchParams } from "next/navigation";
import { Answer, CreateQuizzDto, Question, Quiz } from "@/app/type/quizz/quizz";
import CreateQuizModal from "./CreateQuizModal";
import EditQuestionModal from "./EditQuestionModal";
import QuizList from "./QuizList";

const QuizzesManagement = () => {
  const searchParams = useSearchParams();
  const contentId = searchParams.get("contentId");

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

  const handleDeleteQuestion = async (quizzId: string, questionId: string) => {
    if (!quizzId || !questionId) {
      alert("Cannot delete question: Missing required IDs");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this question?")) {
      return;
    }

    try {
      setLoading(true);
      await deleteQuizzByQuestionId(quizzId, questionId);

      if (contentId) {
        const data = await getQuizzesByContentId(contentId);
        setQuizzes(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNewQuestion = (questionIndex: number) => {
    if (newQuizData.questions.length <= 1) {
      alert(
        "Cannot delete the last question. At least one question is required."
      );
      return;
    }

    const updatedQuestions = newQuizData.questions.filter(
      (_, index) => index !== questionIndex
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
      throw error;
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
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = async () => {
    if (!contentId) return;
    try {
      setLoading(true);
      await createQuizz(newQuizData);
      const data = await getQuizzesByContentId(contentId);
      setQuizzes(Array.isArray(data) ? data : []);
      setShowCreateModal(false);
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
      } catch {
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

        <CreateQuizModal
          showCreateModal={showCreateModal}
          newQuizData={newQuizData}
          onAddQuestion={handleAddQuestion}
          onDeleteQuestion={handleDeleteNewQuestion}
          onQuestionChange={(qIndex, value) => {
            const updatedQuestions = [...newQuizData.questions];
            updatedQuestions[qIndex].question = value;
            setNewQuizData({
              ...newQuizData,
              questions: updatedQuestions,
            });
          }}
          onAnswerChange={(qIndex, aIndex, value) => {
            const updatedQuestions = [...newQuizData.questions];
            updatedQuestions[qIndex].answers[aIndex].answer = value;
            setNewQuizData({
              ...newQuizData,
              questions: updatedQuestions,
            });
          }}
          onCorrectAnswerChange={(qIndex, aIndex, checked) => {
            const updatedQuestions = [...newQuizData.questions];
            updatedQuestions[qIndex].answers[aIndex].isCorrect = checked;
            setNewQuizData({
              ...newQuizData,
              questions: updatedQuestions,
            });
          }}
          onCreateQuiz={handleCreateQuiz}
          onClose={() => setShowCreateModal(false)}
        />

        <EditQuestionModal
          showEditModal={showEditModal}
          editingQuestion={editingQuestion}
          onQuestionChange={(value) => {
            setEditingQuestion(
              editingQuestion
                ? {
                  ...editingQuestion,
                  question: value,
                }
                : null
            );
          }}
          onAnswerChange={(aIndex, value) => {
            if (editingQuestion) {
              const updatedAnswers = [...editingQuestion.answers];
              updatedAnswers[aIndex].answer = value;
              setEditingQuestion({
                ...editingQuestion,
                answers: updatedAnswers,
              });
            }
          }}
          onCorrectAnswerChange={(aIndex, checked) => {
            if (editingQuestion) {
              const updatedAnswers = [...editingQuestion.answers];
              updatedAnswers[aIndex].isCorrect = checked;
              setEditingQuestion({
                ...editingQuestion,
                answers: updatedAnswers,
              });
            }
          }}
          onUpdate={handleUpdateQuestion}
          onClose={() => {
            setShowEditModal(false);
            setEditingQuestion(null);
          }}
        />

        <QuizList
          loading={loading}
          quizzes={quizzes}
          onEditQuestion={handleEditQuestion}
          onDeleteQuestion={handleDeleteQuestion}
        />
      </div>
    </div>
  );
};

export default QuizzesManagement;
