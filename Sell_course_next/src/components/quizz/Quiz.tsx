"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getRandomQuiz, submitQuizAnswers } from "@/app/api/quizz/quizz";
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

const QuizPage = ({ quizzId }: QuizPageProps) => {
  const { id } = useParams();
  const { data: session, status } = useSession();
  console.log("Session data:", session);
  const effectiveId = quizzId || id;
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!effectiveId) return;

      try {
        setLoading(true);
        const quizData = await getRandomQuiz(effectiveId.toString());
        setQuiz(quizData);
      } catch (error) {
        setError("Failed to load quiz questions.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [effectiveId]);

  const handleSelectAnswer = (questionId: string, answerId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerId }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    console.log("Quiz data:", quiz);
    console.log("Current answers:", answers);

    // Check if all questions have been answered
    const unansweredQuestions = quiz.questions.filter(
      (question) => !answers[question.questionId]
    );

    console.log("Unanswered questions:", unansweredQuestions);

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
      quizzId: effectiveId,
      answers: Object.entries(answers).map(([questionId, answerId]) => ({
        questionId,
        answerId,
      })),
    };

    console.log("Formatted answers:", formattedAnswers);

    try {
      setError(null);
      const result = await submitQuizAnswers(formattedAnswers, session.user.token);
      console.log("Submit result:", result);
      setScore(result.score);
      setSubmitted(true);
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      setError(
        "Failed to submit quiz. Please try again. If the problem persists, please refresh the page."
      );
    }
  };

  const handleNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  if (status === "loading") return <p>Loading session...</p>;
  if (status === "unauthenticated") return <p className="text-red-600">Please log in to access the quiz.</p>;
  if (loading) return <p>Loading quiz questions...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!quiz) return <p>No quiz data available.</p>;

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="exam-container">
      <div className="exam-header">
        <h1>Quiz</h1>
        {submitted && score !== null && (
          <div className={score >= 50 ? "scoreSuccess" : "scoreFail"}>
            Your Score: {score}
          </div>
        )}
      </div>
      <div className="exam-content">
        {currentQuestion && (
          <div className="question-card">
            <div className="question-header">
              <span className="question-number">
                Question {currentQuestionIndex + 1}/{quiz.questions.length}
              </span>
            </div>
            <p className="question-text">{currentQuestion.question}</p>
            <div className="answers-list">
              {currentQuestion.answers.map((answer) => (
                <label
                  key={answer.answerId}
                  className={`answer-item ${
                    submitted && answer.isCorrect ? "correct-answer" : ""
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
      </div>
    </div>
  );
};

export default QuizPage;
