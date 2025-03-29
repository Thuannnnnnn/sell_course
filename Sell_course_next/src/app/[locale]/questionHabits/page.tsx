"use client";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { submitUserAnswer } from "@/app/api/userAnswer/userAnswerApi";
import { useSession } from "next-auth/react";
import { QuestionHabit } from "@/app/type/question/question";
import { fetchQuestionHabits } from "@/app/api/questionHabit/questionHabitApi";

const QuestionHabits: React.FC = () => {
  const t = useTranslations("questionHabits");

  const [questions, setQuestions] = useState<QuestionHabit[]>([]);
  const [answers, setAnswers] = useState<
    { questionId: string; answer: string }[]
  >([]);
  const [submitStatus, setSubmitStatus] = useState<{
    message: string;
    type: "success" | "danger";
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { data: session } = useSession();

  useEffect(() => {
    const loadQuestions = async () => {
      setIsLoading(true);
      try {
        const data = await fetchQuestionHabits();
        if (!Array.isArray(data))
          throw new Error("Questions response is not an array");

        setQuestions(data);
        setAnswers(data.map((q) => ({ questionId: q.id, answer: "" }))); // Khởi tạo mảng trả lời đúng format
      } catch (error) {
        console.error("Error fetching questions:", error);
        setSubmitStatus({ message: t("fetchQuestionsFailed"), type: "danger" });
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, [t]);

  const updateAnswer = (index: number, answer: string) => {
    setAnswers((prevAnswers) => {
      const newAnswers = [...prevAnswers];
      newAnswers[index] = { ...newAnswers[index], answer };
      return newAnswers;
    });
  };

  const validateAnswers = (): boolean => {
    if (answers.some((a) => !a.answer.trim())) {
      setSubmitStatus({ message: t("fillAllFields"), type: "danger" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus(null);

    if (!validateAnswers()) return;

    const userId = session?.user?.user_id;
    if (!userId) {
      setSubmitStatus({ message: t("userNotLoggedIn"), type: "danger" });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = { userId, answers }; // Gửi đúng format mới

      await submitUserAnswer(payload);

      setSubmitStatus({ message: t("submissionSuccessful"), type: "success" });
      setAnswers(answers.map((a) => ({ ...a, answer: "" })));
      window.location.href = "/";
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitStatus({ message: t("submissionFailed"), type: "danger" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container my-5">
      <h1 className="text-center mb-4">{t("title")}</h1>

      {isLoading ? (
        <div className="text-center my-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">{t("loadingText")}</span>
          </div>
        </div>
      ) : questions.length > 0 ? (
        <form onSubmit={handleSubmit}>
          {questions.map((question, index) => (
            <div key={question.id} className="mb-3">
              <label
                htmlFor={`question-${index}`}
                className="form-label fw-bold"
              >
                {question.question}
              </label>
              <input
                type="text"
                id={`question-${index}`}
                value={answers[index]?.answer || ""}
                onChange={(e) => updateAnswer(index, e.target.value)}
                placeholder={t("answerPlaceholder")}
                className="form-control"
              />
            </div>
          ))}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                {t("submittingText")}
              </>
            ) : (
              t("submitButton")
            )}
          </button>
        </form>
      ) : (
        <div className="text-center my-5">
          <p>{t("noQuestionsAvailable")}</p>
        </div>
      )}

      {submitStatus && (
        <div
          className={`alert alert-${submitStatus.type} alert-dismissible fade show mt-4`}
          role="alert"
        >
          {submitStatus.message}
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={() => setSubmitStatus(null)}
          ></button>
        </div>
      )}
    </div>
  );
};

export default QuestionHabits;
