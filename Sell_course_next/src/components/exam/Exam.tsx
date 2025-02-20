"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { fetchQuestion, submitExam } from "@/app/api/exam/exam";
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

const ExamPage = () => {
  const { id } = useParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.token) return;

    const fetchExamQuestion = async () => {
      try {
        setLoading(true);
        const examQuestions = await fetchQuestion(session.user.token, id as string);
        setQuestions(examQuestions);
      } catch {
        setError("Failed to load exam questions.");
      } finally {
        setLoading(false);
      }
    };

    fetchExamQuestion();
  }, [session, status, id]);

  const handleSelectAnswer = (questionId: string, answerId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerId }));
  };

  const handleSubmit = async () => {
        if (!session?.user?.token) return;
        const formattedAnswers = Object.entries(answers).map(([questionId, answerId]) => ({
          questionId,
          answerId,
        }));
        try {
          const result = await submitExam(session.user.token, id as string, formattedAnswers);
          setScore(result.score);
          setCorrectAnswers(result.correctAnswers);
          setSubmitted(true);
        } catch (error) {
          console.error("Failed to submit exam:", error);
          setError("Failed to submit exam. Please try again.");
        }
      };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  if (loading) return <p>Loading exam questions...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="exam-container">
      <div className="exam-header">
        <h1>Exam</h1>
        {submitted && <div className="score">Your Score: {score}</div>}
      </div>
      <div className="exam-content">
        {currentQuestion && (
          <div className="question-card">
            <div className="question-header">
              <span className="question-number">
                Question {currentQuestionIndex + 1}/{questions.length}
              </span>
            </div>
            <p className="question-text">{currentQuestion.question}</p>
            <div className="answers-list">
              {currentQuestion.answers.map((answer) => (
                <label
                  key={answer.answerId}
                  className={`answer-item ${submitted && answer.isCorrect ? "correct-answer" : ""}`}
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
                </label>
              ))}
            </div>
          </div>
        )}
        <div className="navigation-buttons">
          <button className="nav-button" onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}>
            Previous
          </button>
          {currentQuestionIndex < questions.length - 1 ? (
            <button className="nav-button" onClick={handleNextQuestion}>
              Next
            </button>
          ) : (
            !submitted && (
              <button className="submit-button" onClick={handleSubmit}>
                Submit Exam
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamPage;
