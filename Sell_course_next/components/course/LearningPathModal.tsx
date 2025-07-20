"use client";

import React, { useEffect, useState } from "react";
import { X, ChevronRight, ChevronLeft, BookOpen, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { RawQuestion } from "@/app/types/learningPath/learningPath";
export interface AvailableSlot {
  day_of_week: number;
  start_time: string;
  duration: number;
}

export interface LearningPathInput {
  userId: string;
  name: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  study_goal: string;
  study_hours_per_week: number;
  total_weeks: number;
  max_minutes_per_day: number;
  no_study_days: number[];
  experience: string;
  available_slots: AvailableSlot[];
  course_ids: string;
  start_date: string;
}

interface LearningPathModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (answers: LearningPathInput) => void;
  courseId: string;
  userId: string;
  userName: string;
}

// Survey answers state
interface SurveyAnswers {
  learning_goal: string;
  time_availability: string;
  preferred_days: string[];
  preferred_time: string;
  learning_style: string;
  difficulty_level: string;
  special_requirements: string;
  start_date: string;
  other_values: Record<string, string>;
}

const defaultSurveyAnswers: SurveyAnswers = {
  learning_goal: "",
  time_availability: "",
  preferred_days: [],
  preferred_time: "",
  learning_style: "",
  difficulty_level: "",
  special_requirements: "",
  start_date: "",
  other_values: {},
};

export default function LearningPathModal({
  isOpen,
  onClose,
  onSubmit,
  courseId,
  userId,
  userName,
}: LearningPathModalProps) {
  const [questions, setQuestions] = useState<RawQuestion[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<SurveyAnswers>(defaultSurveyAnswers);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get<RawQuestion[]>(
          `${process.env.NEXT_PUBLIC_API_URL}/survey-questions`
        );
        setQuestions(res.data);
      } catch (error) {
        console.error("Failed to fetch questions:", error);
      } finally {
        setLoading(false);
      }
    };
    if (isOpen) fetchQuestions();
  }, [isOpen]);

  const currentQuestion = questions[currentStep];
  const isLastStep = currentStep === questions.length - 1;

  // Map question IDs to answer keys
  const getAnswerKey = (questionId: string): keyof SurveyAnswers => {
    switch (questionId) {
      case "a6f51238-237c-4d43-95ad-bb8db6dc7e3a":
        return "learning_goal";
      case "2de3fe94-04cb-40cb-9f13-2d950fa525cf":
        return "time_availability";
      case "bf5fb3cb-a993-448a-80ab-613ea9f3715a":
        return "preferred_days";
      case "0e5d3d82-c201-4eef-86f1-fc1b92f97bb7":
        return "preferred_time";
      case "f1a8f0ea-6bd7-4a66-a36e-1f087a121073":
        return "learning_style";
      case "adb34cf4-fc42-47a2-9559-4a343cb40636":
        return "difficulty_level";
      case "9d68bf30-bb4a-470a-9aea-c9352d1c7d04":
        return "special_requirements";
      case "00d54cb6-2c4d-4da6-b409-2c8d908de27e":
        return "start_date";
      default:
        return "learning_goal";
    }
  };

  const currentAnswerKey = currentQuestion
    ? getAnswerKey(currentQuestion.id)
    : "learning_goal";
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
    surveyAnswers: SurveyAnswers
  ): LearningPathInput => {
    // Level mapping
    const levelMapping: Record<
      string,
      "beginner" | "intermediate" | "advanced" | "expert"
    > = {
      "Cơ bản - Từ những kiến thức nền tảng": "beginner",
      "Trung bình - Có một số kiến thức sẵn": "intermediate",
      "Nâng cao - Đã có kinh nghiệm trong lĩnh vực": "advanced",
      "Chuyên sâu - Muốn nâng cao kỹ năng chuyên môn": "expert",
    };

    // Time mapping (in minutes)
    const timeMapping: Record<string, number> = {
      "Dưới 30 phút": 25,
      "30-60 phút": 45,
      "1-2 giờ": 90,
      "2-3 giờ": 150,
      "Trên 3 giờ": 180,
    };

    // Time slot mapping
    const timeSlotMapping: Record<string, string> = {
      "Sáng sớm (6:00-9:00)": "06:00",
      "Buổi sáng (9:00-12:00)": "09:00",
      "Buổi chiều (12:00-17:00)": "12:00",
      "Buổi tối (17:00-21:00)": "17:00",
      "Tối muộn (21:00-24:00)": "21:00",
    };

    // Day mapping
    const dayMapping: Record<string, number> = {
      "Thứ 2": 2,
      "Thứ 3": 3,
      "Thứ 4": 4,
      "Thứ 5": 5,
      "Thứ 6": 6,
      "Thứ 7": 7,
      "Chủ nhật": 1,
    };
    const learningGoal = surveyAnswers.learning_goal;
    const otherLearningGoal = surveyAnswers.other_values["learning_goal"];
    const finalLearningGoal =
      learningGoal.toLowerCase().includes("khác") && otherLearningGoal
        ? otherLearningGoal
        : learningGoal;

    const learningStyle = surveyAnswers.learning_style;
    const otherLearningStyle = surveyAnswers.other_values["learning_style"];
    const finalLearningStyle =
      learningStyle.toLowerCase().includes("khác") && otherLearningStyle
        ? otherLearningStyle
        : learningStyle;
    const maxMinutesPerDay = timeMapping[surveyAnswers.time_availability] || 90;
    const selectedDays = surveyAnswers.preferred_days
      .map((day) => dayMapping[day])
      .filter((day): day is number => day !== undefined);

    const allDays = [1, 2, 3, 4, 5, 6, 7];
    const noStudyDays = allDays.filter((day) => !selectedDays.includes(day));

    const availableSlots: AvailableSlot[] = selectedDays.map((dayOfWeek) => ({
      day_of_week: dayOfWeek,
      start_time: timeSlotMapping[surveyAnswers.preferred_time] || "09:00",
      duration: maxMinutesPerDay,
    }));

    const studyHoursPerWeek =
      availableSlots.reduce((sum, slot) => sum + slot.duration, 0) / 60;

    return {
      userId: userId, // This should be set from user context
      name: userName, // This should be set from user context
      level: levelMapping[surveyAnswers.difficulty_level] || "beginner",
      study_goal:
        finalLearningGoal +
        " and learning style: " +
        (finalLearningStyle || ""),
      study_hours_per_week: parseFloat(studyHoursPerWeek.toFixed(1)),
      total_weeks: 4, // Default or could be calculated based on goals
      max_minutes_per_day: maxMinutesPerDay,
      no_study_days: noStudyDays,
      experience: surveyAnswers.special_requirements || "",
      available_slots: availableSlots,
      course_ids: courseId,
      start_date:
        surveyAnswers.start_date || new Date().toISOString().split("T")[0],
    };
  };

  const handleSubmit = async () => {
    if (!canProceed) return;
    setIsSubmitting(true);
    try {
      const learningPathInput = convertToLearningPathInput(answers);
      console.log(
        "Learning Path Input:",
        JSON.stringify(learningPathInput, null, 2)
      );
      await onSubmit(learningPathInput);
      onClose();
    } catch (error) {
      console.error("Error submitting learning path:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestionInput = () => {
    const question = currentQuestion;
    if (!question) return null;

    const currentAnswer = answers[currentAnswerKey];
    const answerKey = currentAnswerKey;

    // Hàm kiểm tra xem lựa chọn "Khác" có được chọn không
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
  if (loading)
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white p-6 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Đang tải...</span>
          </div>
        </div>
      </div>
    );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6" />
              <h2 className="text-2xl font-bold">Tạo Learning Path</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>
                Câu hỏi {currentStep + 1} / {questions.length}
              </span>
              <span>
                {questions.length > 0
                  ? Math.round(((currentStep + 1) / questions.length) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all duration-300"
                style={{
                  width: `${
                    questions.length > 0
                      ? ((currentStep + 1) / questions.length) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {currentQuestion?.questionText}
            </h3>
            {currentQuestion?.required && (
              <p className="text-sm text-red-500 mb-4">* Câu hỏi bắt buộc</p>
            )}
          </div>
          {renderQuestionInput()}
        </div>

        <div className="bg-gray-50 p-6 flex items-center justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Quay lại
          </Button>
          <div className="flex items-center gap-2">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index <= currentStep ? "bg-blue-500" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
          {isLastStep ? (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed || isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang tạo...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4" /> Tạo Learning Path
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center gap-2"
            >
              Tiếp theo <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
