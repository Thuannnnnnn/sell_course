"use client";

import React, { useEffect, useState } from "react";
import { X, ChevronRight, ChevronLeft, BookOpen, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";

interface QuestionOption {
  optionId: string;
  text: string;
}

// Định nghĩa interface cho JSON output
interface LearningPathOutput {
  userId: string;
  name: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  study_goal: string;
  study_hours_per_week: number;
  total_weeks: number;
  max_minutes_per_day: number;
  no_study_days: number[];
  experience: string;
  available_slots: {
    day_of_week: number;
    start_time: string;
    duration: number;
  }[];
  course_ids: string;
  start_date: string;
}

// Cập nhật LearningPathAnswers để khớp với LearningPathOutput
export interface LearningPathAnswers extends LearningPathOutput {
  // Các trường từ câu hỏi khảo sát gốc nếu cần giữ lại để xử lý nội bộ
  // Ví dụ: nếu bạn muốn giữ lại các giá trị thô từ form trước khi chuyển đổi
  // difficulty_preference: "beginner" | "intermediate" | "advanced";
  // time_availability: string;
  // preferred_days: string[];
  // preferred_time: string;
  // special_requirements: string;
  timestamp: string;
}

interface RawQuestion {
  id: keyof LearningPathAnswers;
  questionText: string;
  type: "single" | "multiple" | "text";
  required: boolean;
  options: QuestionOption[];
}

interface Question {
  id: keyof LearningPathAnswers;
  question: string;
  type: "single" | "multiple" | "text";
  options?: string[];
  required?: boolean;
}

interface LearningPathModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (answers: LearningPathAnswers) => void;
  courseId: string;
}

const defaultAnswers: LearningPathAnswers = {
  userId: "",
  name: "",
  level: "beginner",
  study_goal: "",
  study_hours_per_week: 0,
  total_weeks: 0,
  max_minutes_per_day: 0,
  no_study_days: [],
  experience: "",
  available_slots: [],
  course_ids: "",
  start_date: "",
  timestamp: new Date().toISOString(),
};

export default function LearningPathModal({
  isOpen,
  onClose,
  onSubmit,
  courseId,
}: LearningPathModalProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<LearningPathAnswers>(defaultAnswers);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get<RawQuestion[]>(
          `${process.env.NEXT_PUBLIC_API_URL}/survey-questions`
        );
        const parsed: Question[] = res.data.map((q) => ({
          id: q.id,
          question: q.questionText,
          type: q.type,
          required: q.required,
          options: q.options?.map((opt) => opt.text) ?? [],
        }));
        setQuestions(parsed);
      } catch (error) {
        console.error("Failed to fetch questions:", error);
      } finally {
        setLoading(false);
      }
    };
    if (isOpen) fetchQuestions();
  }, [isOpen]);

  cocurrentQuestion = questions[currentStep];
  const isLastStep = currentStep === questions.length - 1;
  const canProceed =
    currentQuestion &&
    (!currentQuestion.required || answers[currentQuestion.id]);

  const handleAnswer = (
    questionId: keyof LearningPathAnswers,
    answer: string | string[]
  ) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (canProceed && !isLastStep) setCurrentStep((prev) => prev + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

   const convertToLearningPathInput = (
    surveyAnswers: LearningPathSurveyAnswers,
    newInput: any // This will be the new input structure provided by the user
  ): LearningPathInput => {
    // Map level from survey answers
    const levelMapping: Record<
      string,
      "beginner" | "intermediate" | "advanced" | "expert"
    > = {
      "Cơ bản - Từ những kiến thức nền tảng": "beginner",
      "Trung bình - Có một số kiến thức sẵn": "intermediate",
      "Nâng cao - Đã có kinh nghiệm trong lĩnh vực": "advanced",
      "Chuyên sâu - Muốn nâng cao kỹ năng chuyên môn": "expert",
    };

    // Map thời gian học thành phút
    const timeMapping: Record<string, number> = {
      "Dưới 30 phút": 25,
      "30-60 phút": 45,
      "1-2 giờ": 90,
      "2-3 giờ": 150,
      "Trên 3 giờ": 180,
    };

    // Map thời gian trong ngày thành giờ bắt đầu
    const timeSlotMapping: Record<string, string> = {
      "Sáng sớm (6:00-9:00)": "06:00",
      "Buổi sáng (9:00-12:00)": "09:00",
      "Buổi chiều (12:00-17:00)": "12:00",
      "Buổi tối (17:00-21:00)": "17:00",
      "Tối muộn (21:00-24:00)": "21:00",
    };

    // Map ngày trong tuần
    const dayMapping: Record<string, number> = {
      "Thứ 2": 2,
      "Thứ 3": 3,
      "Thứ 4": 4,
      "Thứ 5": 5,
      "Thứ 6": 6,
      "Thứ 7": 7,
      "Chủ nhật": 1,
    };

    // Determine max_minutes_per_day from survey answers if not provided in new input
    const maxMinutesPerDay =
      newInput.max_minutes_per_day ||
      timeMapping[surveyAnswers.time_availability] ||
      90;

    // Determine no_study_days and available_slots from new input or survey answers
    let noStudyDays: number[] = [];
    let availableSlots: AvailableSlot[] = [];

    if (newInput.available_slots && newInput.available_slots.length > 0) {
      availableSlots = newInput.available_slots;
      const allDays = [1, 2, 3, 4, 5, 6, 7];
      const studyDays = new Set(availableSlots.map((slot) => slot.day_of_week));
      noStudyDays = allDays.filter((day) => !studyDays.has(day));
    } else if (surveyAnswers.preferred_days && surveyAnswers.preferred_time) {
      const selectedDays = surveyAnswers.preferred_days
        .map((day) => dayMapping[day])
        .filter(Boolean);
      const allDays = [1, 2, 3, 4, 5, 6, 7];
      noStudyDays = allDays.filter((day) => !selectedDays.includes(day));

      availableSlots = selectedDays.map((dayOfWeek) => ({
        day_of_week: dayOfWeek,
        start_time: timeSlotMapping[surveyAnswers.preferred_time] || "09:00",
        duration: maxMinutesPerDay,
      }));
    } else {
      // Fallback if neither new input nor survey answers provide enough info
      // This should ideally not happen if survey is properly filled
      noStudyDays = newInput.no_study_days || [];
      availableSlots = newInput.available_slots || [];
    }

    // Calculate study_hours_per_week based on available_slots
    const studyHoursPerWeek =
      availableSlots.reduce((sum, slot) => sum + slot.duration, 0) / 60;

    return {
      userId: newInput.userId || surveyAnswers.userId || "",
      name: newInput.name || surveyAnswers.name || "",
      level:
        newInput.level ||
        levelMapping[surveyAnswers.difficulty_preference] ||
        "beginner",
      study_goal: newInput.study_goal || surveyAnswers.learning_goal || "",
      study_hours_per_week: parseFloat(studyHoursPerWeek.toFixed(1)),
      total_weeks: newInput.total_weeks || surveyAnswers.total_weeks || 4,
      max_minutes_per_day: maxMinutesPerDay,
      no_study_days: noStudyDays,
      experience:
        newInput.experience || surveyAnswers.special_requirements || "",
      available_slots: availableSlots,
      course_ids: newInput.course_ids || surveyAnswers.courseId || "",
      start_date:
        newInput.start_date ||
        surveyAnswers.start_date ||
        new Date().toISOString().split("T")[0],
    };
  };

  const handleSubmit = async () => {
    if (!canProceed) return;
    setIsSubmitting(true);
    try {
      // Chuyển đổi dữ liệu sang format JSON mẫu
      const learningPathOutput = convertToLearningPathOutput(answers, courseId);

      // Log ra console để kiểm tra
      console.log(
        "Learning Path Output:",
        JSON.stringify(learningPathOutput, null, 2)
      );

      // Truyền learningPathOutput vào onSubmit
      await onSubmit(learningPathOutput);
    } catch (error) {
      console.error("Error submitting learning path:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestionInput = () => {
    const question = currentQuestion;
    if (!question) return null;

    switch (question.type) {
      case "single":
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label
                key={index}
                className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  answers[question.id] === option
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={answers[question.id] === option}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                    answers[question.id] === option
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {answers[question.id] === option && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <span className="text-gray-700 font-medium">{option}</span>
              </label>
            ))}
          </div>
        );

      case "multiple":
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label
                key={index}
                className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  (answers[question.id] as string[] | undefined)?.includes(
                    option
                  )
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={
                    (answers[question.id] as string[] | undefined)?.includes(
                      option
                    ) || false
                  }
                  onChange={(e) => {
                    const currentAnswers =
                      (answers[question.id] as string[]) || [];
                    if (e.target.checked) {
                      handleAnswer(question.id, [...currentAnswers, option]);
                    } else {
                      handleAnswer(
                        question.id,
                        currentAnswers.filter((a) => a !== option)
                      );
                    }
                  }}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                    (answers[question.id] as string[] | undefined)?.includes(
                      option
                    )
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {(answers[question.id] as string[] | undefined)?.includes(
                    option
                  ) && (
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
                <span className="text-gray-700 font-medium">{option}</span>
              </label>
            ))}
          </div>
        );

      case "text":
        return (
          <textarea
            value={(answers[question.id] as string) || ""}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            placeholder="Nhập câu trả lời của bạn..."
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none h-32"
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
        Loading...
      </div>
    );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
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
                {Math.round(((currentStep + 1) / questions.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all duration-300"
                style={{
                  width: `${((currentStep + 1) / questions.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {currentQuestion?.question}
            </h3>
            {currentQuestion?.required && (
              <p className="text-sm text-red-500 mb-4">* Câu hỏi bắt buộc</p>
            )}
          </div>
          {renderQuestionInput()}
        </div>

        {/* Footer */}
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
