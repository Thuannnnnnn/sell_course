"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  getRandomQuiz,
  submitQuizAnswers,
  getQuizzResults,
} from "@/app/api/quizz/quizz";
import "../../style/ExamPage.css";
import { Quiz } from "@/app/type/quizz/quizz";

const QuizPage: React.FC<{ contentId: string; quizzId?: string }> = ({
  contentId,
  quizzId,
}) => {
  const { data: session, status } = useSession();
  const token = session?.user?.token;
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [hasPreviousResult, setHasPreviousResult] = useState(false);
  console.log(hasPreviousResult);
  useEffect(() => {
    const fetchQuizData = async () => {
      if (!contentId || !token) return;
      setLoading(true);
      try {
        const quizData = await getRandomQuiz(contentId, quizzId);
        setQuiz(quizData);
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
      } catch {
        setError("Failed to load quiz data.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuizData();
  }, [contentId, quizzId, token]);

  const handleSelectAnswer = (questionId: string, answerId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerId }));
  };

  const handleSubmit = async () => {
    if (!quiz || !session?.user?.user_id || !token) return;
    try {
      setError(null);
      const result = await submitQuizAnswers(
        {
          userId: session.user.user_id,
          quizzId: quiz.quizzId,
          answers: Object.entries(answers).map(([questionId, answerId]) => ({
            questionId,
            answerId,
          })),
        },
        token
      );
      setScore(result.score);
      setSubmitted(true);
    } catch {
      setError("Failed to submit quiz. Please try again.");
    }
  };

  if (status === "loading") return <p>Loading session...</p>;
  if (status === "unauthenticated")
    return <p className="text-red-600">Please log in to access the quiz.</p>;
  if (loading) return <p>Loading quiz questions...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
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
                <label key={answer.answerId} className="answer-item">
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
                </label>
              ))}
            </div>
          </div>
        )}
        <div className="navigation-buttons">
          <button
            className="nav-button"
            onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </button>
          {currentQuestionIndex < quiz.questions.length - 1 ? (
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
        {submitted && score !== null && (
          <div
            className={`score ${score >= 50 ? "scoreSuccess" : "scoreFail"}`}
          >
            Your Score: {score}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
