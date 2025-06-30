import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import {
  FileText,
  Lock,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  GraduationCap,
  ArrowLeft,
  ArrowRight,
  Trophy,
  Target,
  Clock,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { ExamQuestion, ExamAnswer } from "../../app/types/exam/result-exam";
import { resultExamApi } from "../../app/api/courses/exam/resultexam";
import { useSession } from "next-auth/react";

import { Clock, FileText, Lock, AlertTriangle } from "lucide-react";
import { cn } from "../../lib/utils";
interface ExamComponentProps {
  exam: {
    examId: string;
    courseId: string;
    title: string;
    questions: ExamQuestion[];
    totalQuestions: number;
    isLocked: boolean;
  };
  userExamResults?: {
    score: number;
  } | null;
  onExamComplete?: (score: number) => void;
}

interface UserAnswer {
  questionId: string;
  answerId: string;
  selectedAnswer: ExamAnswer;
}

type ExamState = "overview" | "taking" | "completed";

export function ExamComponent({
  exam,
  userExamResults,
  onExamComplete,
}: ExamComponentProps) {
  const { data: session } = useSession();
  const [examState, setExamState] = useState<ExamState>("overview");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string>("");
  const [examScore, setExamScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = exam.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === exam.questions.length - 1;

  const handleStartExam = () => {
    if (exam.isLocked) return;
    setExamState("taking");
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setSelectedAnswerId("");
    setExamScore(0);
    setError(null);
  };

  const handleAnswerSelect = (answerId: string) => {
    if (!currentQuestion) return;

    const selectedAnswer = currentQuestion.answers.find(
      (answer) => answer.answerId === answerId
    );

    if (!selectedAnswer) return;

    setSelectedAnswerId(answerId);

    // Update or add answer
    const existingAnswerIndex = userAnswers.findIndex(
      (answer) => answer.questionId === currentQuestion.questionId
    );

    const newAnswer: UserAnswer = {
      questionId: currentQuestion.questionId,
      answerId: answerId,
      selectedAnswer: selectedAnswer,
    };

    if (existingAnswerIndex >= 0) {
      const updatedAnswers = [...userAnswers];
      updatedAnswers[existingAnswerIndex] = newAnswer;
      setUserAnswers(updatedAnswers);
    } else {
      setUserAnswers([...userAnswers, newAnswer]);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);

      // Set selected answer for next question if already answered
      const nextQuestion = exam.questions[currentQuestionIndex + 1];
      const existingAnswer = userAnswers.find(
        (answer) => answer.questionId === nextQuestion.questionId
      );
      setSelectedAnswerId(existingAnswer?.answerId || "");
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);

      // Set selected answer for previous question
      const prevQuestion = exam.questions[currentQuestionIndex - 1];
      const existingAnswer = userAnswers.find(
        (answer) => answer.questionId === prevQuestion.questionId
      );
      setSelectedAnswerId(existingAnswer?.answerId || "");
    }
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    userAnswers.forEach((userAnswer) => {
      if (userAnswer.selectedAnswer.isCorrect) {
        correctAnswers++;
      }
    });
    return Math.round((correctAnswers / exam.questions.length) * 100);
  };

  const handleSubmitExam = async () => {
    if (userAnswers.length !== exam.questions.length) {
      setError("Please answer all questions before submitting.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const score = calculateScore();
      setExamScore(score);

      // Submit to API if user is authenticated
      if (session?.accessToken) {
        const submissionData = {
          examId: exam.examId,
          courseId: exam.courseId,
          answers: userAnswers.map((answer) => ({
            questionId: answer.questionId,
            answerId: answer.answerId,
          })),
        };

        await resultExamApi.submitExam(submissionData, session.accessToken);
      }

      setExamState("completed");
      onExamComplete?.(score);
    } catch (err) {
      setError("Failed to submit exam. Please try again");
      console.error("Error submitting exam:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetakeExam = () => {
    setExamState("overview");
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setSelectedAnswerId("");
    setExamScore(0);
    setError(null);
  };

  // Set selected answer when question changes
  useEffect(() => {
    if (currentQuestion) {
      const existingAnswer = userAnswers.find(
        (answer) => answer.questionId === currentQuestion.questionId
      );
      setSelectedAnswerId(existingAnswer?.answerId || "");
    }
  }, [currentQuestionIndex, currentQuestion, userAnswers]);

  if (examState === "overview") {
    return (
      <div className="w-full">
        <Card
          className={cn(
            "overflow-hidden transition-all duration-300 shadow-lg hover:shadow-xl border-0",
            "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20",
            exam.isLocked ? "opacity-80" : "hover:scale-[1.01]"
          )}
        >
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white pb-6">
            <CardTitle className="flex items-start gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">{exam.title}</h3>
                <p className="text-blue-100 text-sm leading-relaxed">
                  Test your knowledge with this comprehensive exam. Demonstrate
                  your mastery of the course material and earn your
                  certification.
                </p>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border">
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-medium">
                      Total Questions
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {exam.totalQuestions}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border">
                  <div className="bg-green-100 text-green-600 p-2 rounded-full">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-medium">
                      Duration
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      ~{Math.ceil(exam.totalQuestions * 2)} mins
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border">
                  <div
                    className={cn(
                      "p-2 rounded-full",
                      userExamResults
                        ? "bg-green-100 text-green-600"
                        : "bg-orange-100 text-orange-600"
                    )}
                  >
                    {userExamResults ? (
                      <Trophy className="h-4 w-4" />
                    ) : (
                      <Target className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-medium">
                      Your Score
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {userExamResults
                        ? `${userExamResults.score}%`
                        : "Not taken"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <h4 className="font-semibold text-base mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Exam Requirements
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    Complete all course lessons before taking the exam
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    You need 70% or higher to pass and earn certification
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    You can retake the exam multiple times if needed
                  </li>
                </ul>
              </div>

              {/* Alerts */}
              {exam.isLocked && (
                <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm text-orange-800">
                      Authentication Required
                    </p>
                    <p className="text-xs text-orange-700">
                      Please sign in to take this exam and track your progress
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm text-red-800">Error</p>
                    <p className="text-xs text-red-700">{error}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="p-6 pt-0">
            <Button
              className="w-full py-3 text-base font-semibold"
              onClick={handleStartExam}
              disabled={exam.isLocked}
              size="lg"
            >
              {exam.isLocked ? (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Sign In Required
                </>
              ) : userExamResults ? (
                <>
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Retake Exam
                </>
              ) : (
                <>
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Start Exam
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (examState === "taking") {
    return (
      <div className="w-full">
        <Card className="overflow-hidden shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <div className="flex justify-between items-start mb-3">
              <div>
                <CardTitle className="text-lg font-bold">
                  {exam.title}
                </CardTitle>
                <p className="text-blue-100 mt-1 text-sm">
                  Question {currentQuestionIndex + 1} of {exam.questions.length}
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs text-blue-100">Progress</div>
                <div className="text-sm font-semibold">
                  {userAnswers.length}/{exam.questions.length} answered
                </div>
              </div>
            </div>
            <Progress
              value={((currentQuestionIndex + 1) / exam.questions.length) * 100}
              className="h-2 bg-blue-800/30"
            />
          </CardHeader>

          <CardContent className="p-6">
            {currentQuestion && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 leading-relaxed">
                    {currentQuestion.question}
                  </h3>
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        currentQuestion.difficulty === "easy" &&
                          "bg-green-100 text-green-800",
                        currentQuestion.difficulty === "medium" &&
                          "bg-yellow-100 text-yellow-800",
                        currentQuestion.difficulty === "hard" &&
                          "bg-red-100 text-red-800"
                      )}
                    >
                      {currentQuestion.difficulty}
                    </span>
                    <span className="text-xs text-gray-500">
                      Weight: {currentQuestion.weight}
                    </span>
                  </div>
                </div>

                <RadioGroup
                  value={selectedAnswerId}
                  onValueChange={handleAnswerSelect}
                  className="space-y-3"
                >
                  {currentQuestion.answers.map((answer, index) => (
                    <div
                      key={answer.answerId}
                      className={cn(
                        "flex items-center space-x-3 border-2 p-4 rounded-lg transition-all cursor-pointer",
                        selectedAnswerId === answer.answerId
                          ? "border-blue-500 bg-blue-50 shadow-md"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      )}
                      onClick={() => handleAnswerSelect(answer.answerId)}
                    >
                      <RadioGroupItem
                        value={answer.answerId}
                        id={`answer-${index}`}
                        className="w-4 h-4"
                      />
                      <Label
                        htmlFor={`answer-${index}`}
                        className="flex-1 cursor-pointer text-sm leading-relaxed"
                      >
                        {answer.answer}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between p-6 bg-gray-50">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-3">
              {isLastQuestion ? (
                <Button
                  onClick={handleSubmitExam}
                  disabled={
                    userAnswers.length !== exam.questions.length || isSubmitting
                  }
                  className="min-w-[120px] px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {isSubmitting ? "Submitting..." : "Submit Exam"}
                </Button>
              ) : (
                <Button
                  onClick={handleNextQuestion}
                  disabled={!selectedAnswerId}
                  className="px-6 py-2"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (examState === "completed") {
    return (
      <div className="w-full space-y-6">
        {/* Score Summary */}
        <Card className="text-center overflow-hidden border-0 shadow-xl">
          <div
            className={cn(
              "p-6 bg-gradient-to-br",
              examScore >= 70
                ? "from-green-500 to-emerald-600 text-white"
                : "from-orange-500 to-red-500 text-white"
            )}
          >
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <span className="text-2xl font-bold">{examScore}%</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-3">Exam Completed!</h2>
            <p className="text-base mb-4 opacity-90">
              You scored{" "}
              {userAnswers.filter((a) => a.selectedAnswer.isCorrect).length} out
              of {exam.questions.length} questions correctly
            </p>
            {examScore >= 70 ? (
              <div className="flex items-center justify-center gap-2 mb-4">
                <Trophy className="h-5 w-5" />
                <span className="text-base font-semibold">
                  Congratulations! You passed the exam!
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 mb-4">
                <AlertCircle className="h-5 w-5" />
                <span className="text-base font-semibold">
                  Keep studying and try again!
                </span>
              </div>
            )}
            <Button
              onClick={handleRetakeExam}
              variant="secondary"
              size="lg"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              Retake Exam
            </Button>
          </div>
        </Card>

        {/* Detailed Results */}
        <Card className="overflow-hidden border-0 shadow-lg">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="text-xl">Detailed Results</CardTitle>
            <p className="text-sm text-gray-600">
              Review your answers and see the correct solutions
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {exam.questions.map((question, index) => {
                const userAnswer = userAnswers.find(
                  (a) => a.questionId === question.questionId
                );
                const isCorrect = userAnswer?.selectedAnswer.isCorrect || false;

                return (
                  <div
                    key={question.questionId}
                    className="border rounded-lg p-4 bg-white shadow-sm"
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                          isCorrect
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        )}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-base mb-2 leading-relaxed">
                          {question.question}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                          <span
                            className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium",
                              question.difficulty === "easy" &&
                                "bg-green-100 text-green-800",
                              question.difficulty === "medium" &&
                                "bg-yellow-100 text-yellow-800",
                              question.difficulty === "hard" &&
                                "bg-red-100 text-red-800"
                            )}
                          >
                            {question.difficulty}
                          </span>
                          {isCorrect ? (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="h-3 w-3" />
                              <span className="font-medium">Correct</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-red-600">
                              <AlertCircle className="h-3 w-3" />
                              <span className="font-medium">Incorrect</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 ml-11">
                      {question.answers.map((answer) => {
                        const isSelected =
                          userAnswer?.answerId === answer.answerId;
                        const isCorrectAnswer = answer.isCorrect;

                        return (
                          <div
                            key={answer.answerId}
                            className={cn(
                              "p-3 rounded-md border-2 transition-colors",
                              isCorrectAnswer && "border-green-500 bg-green-50",
                              isSelected &&
                                !isCorrectAnswer &&
                                "border-red-500 bg-red-50",
                              !isSelected &&
                                !isCorrectAnswer &&
                                "border-gray-200 bg-gray-50"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                                  isCorrectAnswer &&
                                    "border-green-500 bg-green-500",
                                  isSelected &&
                                    !isCorrectAnswer &&
                                    "border-red-500 bg-red-500",
                                  !isSelected &&
                                    !isCorrectAnswer &&
                                    "border-gray-300"
                                )}
                              >
                                {(isSelected || isCorrectAnswer) && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                )}
                              </div>
                              <span className="flex-1 text-sm">
                                {answer.answer}
                              </span>
                              {isCorrectAnswer && (
                                <div className="flex items-center gap-1 text-green-700">
                                  <CheckCircle className="h-4 w-4" />
                                  <span className="font-medium text-xs">
                                    Correct Answer
                                  </span>
                                </div>
                              )}
                              {isSelected && !isCorrectAnswer && (
                                <div className="flex items-center gap-1 text-red-700">
                                  <AlertCircle className="h-4 w-4" />
                                  <span className="font-medium text-xs">
                                    Your Answer
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
