/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getRandomQuiz, submitQuizAnswers, getQuizzResults } from "@/app/api/quizz/quizz";
import { useSession } from "next-auth/react";
import "../../style/ExamPage.css";

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
  quizId: string;
  questions: Question[];
}

interface QuizPageProps {
  quizzId?: string;
}

const QuizPage: React.FC<QuizPageProps> = ({ quizzId }) => {
  const { id } = useParams();
  const { data: session, status } = useSession();
  const effectiveId = quizzId || id;
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
        setLoading(true);
        const result = await getQuizzResults(session.user.token, effectiveId.toString());
        if (result && result.score !== undefined) {
          setScore(result.score);
          setHasPreviousResult(true);
        } else {
          const quizData = await getRandomQuiz(effectiveId.toString());
          setQuiz(quizData);
        }
      } catch (error) {
        setError("Failed to load quiz data.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
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

    if (status !== "authenticated" || !session?.user?.user_id || !session?.user?.token) {
      setError("Your session has expired. Please log in again to submit the quiz.");
      return;
    }

    const formattedAnswers = {
      userId: session.user.user_id,
      quizzId: Array.isArray(effectiveId) ? effectiveId[0] : effectiveId,
      answers: Object.entries(answers).map(([questionId, answerId]) => ({
        questionId,
        answerId
      })),
    };

    try {
      setError(null);
      const result = await submitQuizAnswers(formattedAnswers, session.user.token);
      setScore(result.score);
      setSubmitted(true);
    } catch (error) {
      setError(
        "Failed to submit quiz. Please try again. If the problem persists, please refresh the page."
      );
    }
  };

  const handleNextQuestion = (): void => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = (): void => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleRetry = async (): Promise<void> => {
    setAnswers({});
    setSubmitted(false);
    setScore(null);
    setHasPreviousResult(false);
    setQuiz(null);
    setCurrentQuestionIndex(0);
    setLoading(true);

    try {
      if (!session?.user?.token || !effectiveId) return;
      const quizData = await getRandomQuiz(effectiveId.toString());
      setQuiz(quizData);
    } catch (error) {
      setError("Failed to load new quiz questions.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") return <p>Loading session...</p>;
  if (status === "unauthenticated") return <p className="text-red-600">Please log in to access the quiz.</p>;
  if (loading) return <p>Loading quiz questions...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  if (hasPreviousResult) {
    return (
      <div className="exam-container">
        <h1>Quiz Result</h1>
        <div className={`score ${score && score >= 50 ? "scoreSuccess" : "scoreFail"}`}>
          Your Score: {score}
        </div>
        <button className="retry-button" onClick={handleRetry}>Retry Quiz</button>
      </div>
    );
  }

  if (!quiz) return <p>No quiz data available.</p>;

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="exam-container">
      <h1>Quiz</h1>
      <div className="exam-content">
        {currentQuestion && (
          <div className="question-card">
            <span className="question-number">
              Question {currentQuestionIndex + 1}/{quiz.questions.length}
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
                        : answers[currentQuestion.questionId] === answer.answerId
                        ? "incorrect-answer"
                        : ""
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name={currentQuestion.questionId}
                    value={answer.answerId}
                    checked={answers[currentQuestion.questionId] === answer.answerId}
                    onChange={() => handleSelectAnswer(currentQuestion.questionId, answer.answerId)}
                    disabled={submitted}
                  />
                  {answer.answer}
                  {submitted && answer.isCorrect && <span className="correct-indicator"> ✓</span>}
                  {submitted && !answer.isCorrect && answers[currentQuestion.questionId] === answer.answerId &&
                    <span className="incorrect-indicator"> ✗</span>}
                </label>
              ))}
            </div>
          </div>
        )}
        <div className="navigation-buttons">
          <button
            className="nav-button"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </button>
          {currentQuestionIndex < quiz.questions.length - 1 ? (
            <button className="nav-button" onClick={handleNextQuestion}>
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
        {submitted && score !== null && (
          <div>
            <div className={`score ${score >= 50 ? "scoreSuccess" : "scoreFail"}`}>
              Your Score: {score}
            </div>
            <button className="retry-button" onClick={handleRetry}>
              Retry Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;