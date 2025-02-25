/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getRandomQuiz,
  submitQuizAnswers,
  getQuizzResults,
} from "@/app/api/quizz/quizz";
import { useSession } from "next-auth/react";
import "../../style/ExamPage.css";
import { Question, Quiz } from "@/app/type/quizz/quizz";

const QuizPage: React.FC<{ contentId: string; quizzId?: string }> = ({
  contentId,
  lessonId,
  onComplete,
}) => {
  const { id } = useParams();
  const { data: session, status } = useSession();
  const token = session?.user?.token;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [hasPreviousResult, setHasPreviousResult] = useState(false);

  useEffect(() => {
    const fetchQuizData = async () => {
      if (!effectiveId || !session?.user?.token) return;

      try {
        const quizData = await getRandomQuiz(contentId, quizzId);
        setQuiz(quizData);
        setQuestions(quizData.questions);
        if (quizData?.quizzId) {
          try {
            const result = await getQuizzResults(
              token,
              contentId,
              quizData.quizzId
            );
            if (result?.score !== undefined) {
              setScore(result.score);
              setHasPreviousResult(true);
            }
          } catch {}
        }
      } catch (error) {
        setError("Failed to load quiz data.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
    if (score !== null && score > 50) {
      onComplete(contentId, lessonId);
    }
  }, [effectiveId, session?.user?.token]);

  const handleSelectAnswer = (questionId: string, answerId: string): void => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerId }));
  };

  const handleSubmit = async (): Promise<void> => {
    if (!quiz) return;

    const unansweredQuestions = quiz.questions.filter(
      (question) => !answers[question.questionId]
    );

    if (unansweredQuestions.length > 0) {
      setError(
        `Please answer all questions before submitting. ${unansweredQuestions.length} questions remaining.`
      );
      return;
    }

    if (
      status !== "authenticated" ||
      !session?.user?.user_id ||
      !session?.user?.token
    ) {
      setError(
        "Your session has expired. Please log in again to submit the quiz."
      );
      return;
    }

    const formattedAnswers = {
      userId: session.user.user_id,
      quizzId: Array.isArray(effectiveId) ? effectiveId[0] : effectiveId,
      answers: Object.entries(answers).map(([questionId, answerId]) => ({
        questionId,
        answerId,
      })),
    };

    try {
      setError(null);
      const result = await submitQuizAnswers(
        formattedAnswers,
        session.user.token
      );
      setScore(result.score);
      setSubmitted(true);
      setHasPreviousResult(true);
    } catch {
      setError("Failed to submit quiz. Please try again.");
    }
  };

  const handleRetry = async () => {
    setAnswers({});
    setSubmitted(false);
    setScore(null);
    setHasPreviousResult(false);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setLoading(true);

    try {
      if (!session?.user?.token) return;
      const quizData = await getRandomQuiz(contentId, quizzId);
      setQuiz(quizData);
      setQuestions(quizData.questions);
    } catch {
      setError("Failed to reload quiz questions.");
    } finally {
      setLoading(false);
    }
  };

  if (hasPreviousResult) {
    return (
      <div className="exam-container">
        <h1>Quiz Result</h1>
        <div
          className={`score ${
            score && score >= 50 ? "scoreSuccess" : "scoreFail"
          }`}
        >
          Your Score: {score}
        </div>
        <button className="retry-button" onClick={handleRetry}>
          Retry Quiz
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="exam-container">
      <h1>Quiz</h1>
      <div className="exam-content">
        {currentQuestion && (
          <div className="question-card">
            <span className="question-number">
              Question {currentQuestionIndex + 1}/{questions.length}
            </span>
            <p className="question-text">{currentQuestion.question}</p>
            <div className="answers-list">
              {currentQuestion.answers.map((answer) => (
                <label
                  key={answer.answerId}
                  className={`answer-item ${
                    submitted
                      ? answer.isCorrect
                        ? "correct-answer"
                        : answers[currentQuestion.questionId] ===
                          answer.answerId
                        ? "incorrect-answer"
                        : ""
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name={currentQuestion.questionId}
                    value={answer.answerId}
                    checked={
                      answers[currentQuestion.questionId] === answer.answerId
                    }
                    onChange={() =>
                      handleSelectAnswer(
                        currentQuestion.questionId,
                        answer.answerId
                      )
                    }
                    disabled={submitted}
                  />
                  {answer.answer}
                  {submitted && answer.isCorrect && (
                    <span className="correct-indicator"> ✓</span>
                  )}
                  {submitted &&
                    !answer.isCorrect &&
                    answers[currentQuestion.questionId] === answer.answerId && (
                      <span className="incorrect-indicator"> ✗</span>
                    )}
                </label>
              ))}
            </div>
          </div>
        )}
        <div className="navigation-buttons">
          <button
            className="nav-button"
            onClick={() =>
              setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))
            }
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </button>
          {currentQuestionIndex < questions.length - 1 ? (
            <button
              className="nav-button"
              onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
            >
              Next
            </button>
          ) : (
            !submitted && (
              <button className="submit-button" onClick={handleSubmit}>
                Submit Quiz
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
