"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  getRandomQuiz,
  submitQuizAnswers,
  getQuizzResults,
} from "@/app/api/quizz/quizz";
import "../../style/ExamPage.css";
import { Question, Quiz } from "@/app/type/quizz/quizz";

const QuizPage: React.FC<{ contentId: string; quizzId?: string }> = ({
  contentId,
  quizzId,
}) => {
  const { data: session } = useSession();
  const token = session?.user?.token;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [hasPreviousResult, setHasPreviousResult] = useState(false);

  useEffect(() => {
    const fetchQuizData = async () => {
      if (!contentId || !token) return;
      setLoading(true);
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
      } catch {
        new Notification("Failed to load quiz data.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuizData();
  }, [contentId, quizzId, token]);

  if (loading) {
    return <p>Loading quiz...</p>;
  }

  const handleSelectAnswer = (questionId: string, answerId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerId }));
  };

  const handleSubmit = async () => {
    if (!quiz || !session?.user?.user_id || !token) return;
    try {
      new Notification("null", {
        body: "Quiz submitted successfully!",
      });
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
      setHasPreviousResult(true);
    } catch {
      new Notification("Failed to submit quiz. Please try again.");
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
      new Notification("Failed to load quiz data.");
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
