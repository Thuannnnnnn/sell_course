"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { fetchQuestion, getExamResults, submitExam } from "@/app/api/exam/exam";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [hasPreviousResult, setHasPreviousResult] = useState(false);

  const { data: session, status } = useSession();

  console.log(loading, error)

  useEffect(() => {
    if (status === "loading" || !session?.user?.token) return;

    const fetchExamData = async () => {
      setLoading(true);
      try {
        const result = await getExamResults(session.user.token, id as string);
        if (result && result.score !== undefined) {
          setScore(result.score);
          setHasPreviousResult(true);
        } else {
          const examQuestions = await fetchQuestion(session.user.token, id as string);
          setQuestions(examQuestions);
        }
      } catch {
        setError("Failed to load exam data.");
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();
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
      setSubmitted(true);
      setHasPreviousResult(true);
    } catch {
      setError("Failed to submit exam. Please try again.");
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
      const examQuestions = await fetchQuestion(session.user.token, id as string);
      setQuestions(examQuestions);
    } catch {
      setError("Failed to reload exam questions.");
    } finally {
      setLoading(false);
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

  if (hasPreviousResult) {
    return (
      <div className="exam-container">
        <h1>Exam Result</h1>
        <div className={`score ${score && score >= 50 ? "scoreSuccess" : "scoreFail"}`}>
          Your Score: {score}
        </div>
        <button className="retry-button" onClick={handleRetry}>Retry Exam</button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="exam-container">
      <h1>Exam</h1>
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
          <button className="nav-button" onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}>Previous</button>
          {currentQuestionIndex < questions.length - 1 ? (
            <button className="nav-button" onClick={handleNextQuestion}>Next</button>
          ) : (
            !submitted && (
              <button className="submit-button" onClick={handleSubmit}>Submit Exam</button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamPage;