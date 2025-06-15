import React from "react";
import { cn } from "../../lib/utils";

interface PasswordValidationSubtitleProps {
  password: string;
  className?: string;
}

interface ValidationRule {
  label: string;
  isValid: (password: string) => boolean;
}

const validationRules: ValidationRule[] = [
  {
    label: "At least 1 capital letter",
    isValid: (password: string) => /[A-Z]/.test(password),
  },
  {
    label: "At least 1 number",
    isValid: (password: string) => /[0-9]/.test(password),
  },
  {
    label: "At least 1 special character",
    isValid: (password: string) =>
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  },
];

export const PasswordValidationSubtitle: React.FC<
  PasswordValidationSubtitleProps
> = ({ password, className }) => {
  return (
    <div className={cn("mt-2 space-y-1", className)}>
      {validationRules.map((rule, index) => {
        const isValid = password ? rule.isValid(password) : false;
        const hasStartedTyping = password.length > 0;

        return (
          <div
            key={index}
            className={cn(
              "flex items-center text-xs font-medium transition-colors duration-200",
              !hasStartedTyping
                ? "text-gray-400"
                : isValid
                ? "text-green-600"
                : "text-red-500"
            )}
          >
            <div
              className={cn(
                "mr-2 h-2 w-2 rounded-full transition-colors duration-200",
                !hasStartedTyping
                  ? "bg-gray-400"
                  : isValid
                  ? "bg-green-600"
                  : "bg-red-500"
              )}
            />
            <span>{rule.label}</span>
            {hasStartedTyping && isValid && (
              <svg
                className="ml-1 h-3 w-3 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
};
