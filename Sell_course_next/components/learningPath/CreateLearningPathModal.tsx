"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Target,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  createLearningPathAPI,
  createN8nAPI,
  createSurveyAPI,
} from "@/app/api/learningPath/learningPathAPI";
import {
  LearningPathInput,
  RawQuestion,
  LearningPlanData,
  CompletionCheckResult,
} from "@/app/types/learningPath/learningPath";
import { checkCanCreateNewLearningPath } from "@/utils/learningPathUtils";


interface CreateLearningPathModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  userId: string;
  userName: string;
  token: string;
  existingLearningPlans?: LearningPlanData[]; // Thêm prop để kiểm tra existing plans
}

// Survey answers state
interface SurveyAnswers {
  topic: string;
  learning_goal: string;
  current_level: string;
  has_prior_knowledge: string;
  target_level: string;
  desired_duration: string;
  preferred_learning_styles: string[];
  learning_order: string;
  want_progress_tracking: string;
  want_mentor_or_AI_assist: string;
  post_learning_outcome: string;
  userName: string;
  userId: string;
  other_values: Record<string, string>;
}

const defaultSurveyAnswers: SurveyAnswers = {
  topic: "",
  learning_goal: "",
  current_level: "",
  has_prior_knowledge: "",
  target_level: "",
  desired_duration: "",
  preferred_learning_styles: [],
  learning_order: "",
  want_progress_tracking: "",
  want_mentor_or_AI_assist: "",
  post_learning_outcome: "",
  userName: "",
  userId: "",
  other_values: {},
};

export default function CreateLearningPathModal({
  isOpen,
  onClose,
  onSubmit,
  userId,
  userName,
  token,
  existingLearningPlans = [],
}: CreateLearningPathModalProps) {
  const [questions, setQuestions] = useState<RawQuestion[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<SurveyAnswers>(defaultSurveyAnswers);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completionCheck, setCompletionCheck] =
    useState<CompletionCheckResult | null>(null);
  const [checkingCompletion, setCheckingCompletion] = useState(false);

  const surveyAPI = createSurveyAPI();
  const n8nAPI = createN8nAPI();
  const learningPathAPI = createLearningPathAPI(token);

  useEffect(() => {
    const initializeModal = async () => {
      if (!isOpen) return;

      try {
        setLoading(true);
        setCheckingCompletion(true);

        // Kiểm tra điều kiện tạo learning path mới
        const completionResult = await checkCanCreateNewLearningPath(
          existingLearningPlans,
          userId,
          token
        );
        setCompletionCheck(completionResult);

        // Nếu không thể tạo mới, hiển thị thông báo và không load questions
        if (
          !completionResult.canCreateNew &&
          existingLearningPlans.length > 0
        ) {
          setCheckingCompletion(false);
          setLoading(false);
          return;
        }

        // Load questions nếu có thể tạo learning path mới
        const questionsData = await surveyAPI.getQuestions();
        setQuestions(questionsData);

        // Reset form
        setAnswers({ ...defaultSurveyAnswers, userId, userName });
        setCurrentStep(0);
      } catch (error) {
        console.error("Failed to initialize modal:", error);
        toast.error("Failed to load. Please try again.");
      } finally {
        setLoading(false);
        setCheckingCompletion(false);
      }
    };

    initializeModal();
  }, [isOpen, userId, userName, token, existingLearningPlans]);

  const currentQuestion = questions[currentStep];
  const isLastStep = currentStep === questions.length - 1;

  const getAnswerKey = (questionId: string): keyof SurveyAnswers => {
    // Map question IDs to answer keys based on your question structure
    const questionMapping: Record<string, keyof SurveyAnswers> = {
      "6928a00f-47be-47ec-b267-e5d6234d7ca9": "topic",
      "d1fd2c25-66cf-4290-834f-6bbc555e147d": "learning_goal",
      "f7e006de-22c1-42b1-95cb-152d30ce3e03": "current_level",
      "133d5b24-bb22-46a4-82e1-1bf89764431a": "has_prior_knowledge",
      "068818da-02ee-4402-8037-9c5648a14a2d": "target_level",
      "7d1fd292-cde2-4466-bc5f-6aea40049831": "desired_duration",
      "43d6b66a-845e-458f-9443-d0cf11d4b4c2": "preferred_learning_styles",
      "b855c9b8-b0a0-41ec-a501-c65373330322": "learning_order",
      "f18a0d34-d6a2-46fc-8249-bcc7550a43be": "want_progress_tracking",
      "2745b2e1-f21d-4f72-ac12-83f4567b855c": "want_mentor_or_AI_assist",
      "cb42d249-5f5e-4e53-a589-9457d131c507": "post_learning_outcome",
      "4a50e5d5-36e4-464d-b8af-2940d289cc46": "userName",
    };

    return questionMapping[questionId] || "topic";
  };

  const currentAnswerKey = currentQuestion
    ? getAnswerKey(currentQuestion.id)
    : "topic";

  const canProceed =
    currentQuestion &&
    (!currentQuestion.required ||
      (currentQuestion.type === "multiple"
        ? (answers[currentAnswerKey] as string[])?.length > 0
        : answers[currentAnswerKey]));

  const handleAnswer = (answer: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [currentAnswerKey]: answer }));
  };

  const handleNext = () => {
    if (canProceed && !isLastStep) setCurrentStep((prev) => prev + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  const convertToLearningPathInput = (
    surveyAnswers: SurveyAnswers,
    userId: string,
    userName: string
  ): LearningPathInput => {
    const levelMapping: Record<
      string,
      "Beginner" | "Intermediate" | "Advanced" | "Expert"
    > = {
      "Cơ bản": "Beginner",
      "Trung bình": "Intermediate",
      "Nâng cao": "Advanced",
      "Chuyên sâu": "Expert",
      "Trình độ cơ bản": "Beginner",
      "Trình độ trung bình": "Intermediate",
      "Trình độ nâng cao": "Advanced",
    };

    const booleanMapping: Record<string, boolean> = {
      Có: true,
      Không: false,
      "Có, tôi muốn": true,
      "Không, tôi không muốn": false,
    };

    const getFinalValue = (
      answer: string,
      otherValue: string | undefined
    ): string => {
      return answer.toLowerCase().includes("khác") && otherValue
        ? otherValue
        : answer;
    };

    const finalLearningGoal = getFinalValue(
      surveyAnswers.learning_goal,
      surveyAnswers.other_values["learning_goal"]
    );
    const finalPostLearningOutcome = getFinalValue(
      surveyAnswers.post_learning_outcome,
      surveyAnswers.other_values["post_learning_outcome"]
    );

    return {
      userId: userId,
      userName: userName,
      topic: surveyAnswers.topic,
      learning_goal: finalLearningGoal,
      target_level: levelMapping[surveyAnswers.target_level] || "Beginner",
      current_level: levelMapping[surveyAnswers.current_level] || "Beginner",
      has_prior_knowledge:
        booleanMapping[surveyAnswers.has_prior_knowledge] || false,
      desired_duration: surveyAnswers.desired_duration,
      preferred_learning_styles: surveyAnswers.preferred_learning_styles,
      learning_order: surveyAnswers.learning_order,
      output_expectations: {
        want_progress_tracking:
          booleanMapping[surveyAnswers.want_progress_tracking] || false,
        want_mentor_or_AI_assist:
          booleanMapping[surveyAnswers.want_mentor_or_AI_assist] || false,
        post_learning_outcome: finalPostLearningOutcome,
      },
    };
  };

  const handleSubmit = async () => {
    if (!canProceed) return;

    // Double check completion status before submitting
    if (
      completionCheck &&
      !completionCheck.canCreateNew &&
      existingLearningPlans.length > 0
    ) {
      toast.error(
        "You must complete at least one learning path 100% before creating a new one."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Convert survey answers to learning path input
      const learningPathInput = convertToLearningPathInput(
        answers,
        userId,
        userName
      );

      toast.info("Processing your learning path...", {
        duration: 3000,
      });

      // Step 2: Send data to n8n for processing
      const n8nResponse = await n8nAPI.processLearningPath(learningPathInput);

      toast.info("Saving your learning path...", {
        duration: 2000,
      });

      // Step 3: Save the processed data to backend
      if (n8nResponse) {
        await learningPathAPI.saveLearningPathFromN8n(n8nResponse);
        toast.success("Learning path created successfully!");
      } else {
        toast.error("Failed to create learning path. Invalid data from n8n.");
      }

      // Step 4: Call the onSubmit callback to refresh the parent component
      await onSubmit();

      // Step 5: Close modal
      onClose();
    } catch (error) {
      console.error("Error in learning path creation flow:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create learning path. Please try again.",
        {
          duration: 5000,
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForceClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const renderQuestionInput = () => {
    const question = currentQuestion;
    if (!question) return null;

    const currentAnswer = answers[currentAnswerKey];
    const answerKey = currentAnswerKey;

    const isOtherSelected = (
      answer: string | string[] | undefined
    ): boolean => {
      if (!answer) return false;
      const otherOptionText = question.options?.find((opt) =>
        opt.text.toLowerCase().includes("khác")
      )?.text;
      if (!otherOptionText) return false;

      if (Array.isArray(answer)) {
        return answer.includes(otherOptionText);
      }
      return answer === otherOptionText;
    };

    const handleOtherInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setAnswers((prev) => ({
        ...prev,
        other_values: {
          ...prev.other_values,
          [answerKey]: e.target.value,
        },
      }));
    };

    switch (question.type) {
      case "single":
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label
                key={index}
                className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  currentAnswer === option.text
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.text}
                  checked={currentAnswer === option.text}
                  onChange={(e) => handleAnswer(e.target.value)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                    currentAnswer === option.text
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {currentAnswer === option.text && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <span className="text-gray-700 font-medium">{option.text}</span>
              </label>
            ))}

            {(typeof currentAnswer === "string" ||
              Array.isArray(currentAnswer)) &&
              isOtherSelected(currentAnswer) && (
                <div className="pt-2 pl-4">
                  <input
                    type="text"
                    placeholder="Vui lòng nhập lựa chọn của bạn..."
                    value={answers.other_values[answerKey] || ""}
                    onChange={handleOtherInputChange}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}
          </div>
        );

      case "multiple":
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label
                key={index}
                className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  (currentAnswer as string[])?.includes(option.text)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={
                    (currentAnswer as string[])?.includes(option.text) || false
                  }
                  onChange={(e) => {
                    const currentAnswers = (currentAnswer as string[]) || [];
                    if (e.target.checked) {
                      handleAnswer([...currentAnswers, option.text]);
                    } else {
                      handleAnswer(
                        currentAnswers.filter((a) => a !== option.text)
                      );
                    }
                  }}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                    (currentAnswer as string[])?.includes(option.text)
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {(currentAnswer as string[])?.includes(option.text) && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-gray-700 font-medium">{option.text}</span>
              </label>
            ))}
            {(typeof currentAnswer === "string" ||
              Array.isArray(currentAnswer)) &&
              isOtherSelected(currentAnswer) && (
                <div className="pt-2 pl-4">
                  <input
                    type="text"
                    placeholder="Vui lòng nhập lựa chọn của bạn..."
                    value={answers.other_values[answerKey] || ""}
                    onChange={handleOtherInputChange}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}
          </div>
        );

      case "text":
        return (
          <textarea
            value={(currentAnswer as string) || ""}
            onChange={(e) => handleAnswer(e.target.value)}
            placeholder="Nhập câu trả lời của bạn..."
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none h-32"
          />
        );

      case "date":
        return (
          <input
            type="date"
            value={(currentAnswer as string) || ""}
            onChange={(e) => handleAnswer(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
          />
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  // Render completion check screen
  if (checkingCompletion) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Checking Requirements
            </h3>
            <p className="text-gray-600">
              Verifying your learning path completion status...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render restriction screen if cannot create new path
  if (
    completionCheck &&
    !completionCheck.canCreateNew &&
    existingLearningPlans.length > 0
  ) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Complete Current Path
              </h2>
            </div>
            <button
              onClick={handleForceClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="text-center mb-6">
              <p className="text-gray-600 mb-4">
                You need to complete at least one learning path 100% before
                creating a new one.
              </p>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-amber-800 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-medium">Current Status</span>
                </div>
                <div className="text-sm text-amber-700">
                  <p>
                    Completed paths: {completionCheck.completedPaths.length}
                  </p>
                  <p>
                    Incomplete paths: {completionCheck.incompletePaths.length}
                  </p>
                  <p>
                    Average progress:{" "}
                    {Math.round(completionCheck.overallProgress)}%
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-500">
                Continue with your current learning path to unlock the ability
                to create new ones.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleForceClose}
                variant="outline"
                className="flex-1"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  handleForceClose();
                  // Optionally trigger navigation to current learning path
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Continue Learning
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Create Learning Path
              </h2>
              <p className="text-sm text-gray-600">
                Step {currentStep + 1} of {questions.length}
              </p>
            </div>
          </div>
          <button
            onClick={handleForceClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentStep + 1) / questions.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading questions...</p>
            </div>
          ) : currentQuestion ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {currentQuestion.questionText}
              </h3>
              {currentQuestion.required && (
                <p className="text-sm text-red-600 mb-4">* Required</p>
              )}
              {renderQuestionInput()}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No questions available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0 || isSubmitting}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index <= currentStep ? "bg-blue-500" : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          {isLastStep ? (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed || isSubmitting}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Create Learning Path
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed || isSubmitting}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
