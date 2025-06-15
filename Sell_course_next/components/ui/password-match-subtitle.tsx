import React from "react";
import { cn } from "../../lib/utils";

interface PasswordMatchSubtitleProps {
  password: string;
  confirmPassword: string;
  className?: string;
}

export const PasswordMatchSubtitle: React.FC<PasswordMatchSubtitleProps> = ({
  password,
  confirmPassword,
  className,
}) => {
  // Don't show anything if confirm password is empty
  if (!confirmPassword) {
    return (
      <div className={cn("mt-2", className)}>
        <div className="flex items-center text-xs font-medium text-gray-400">
          <div className="mr-2 h-2 w-2 rounded-full bg-gray-400" />
          <span>Re-enter password to confirm</span>
        </div>
      </div>
    );
  }

  const isMatching = password === confirmPassword;

  return (
    <div className={cn("mt-2", className)}>
      <div
        className={cn(
          "flex items-center text-xs font-medium transition-colors duration-200",
          isMatching ? "text-green-600" : "text-red-500"
        )}
      >
        <div
          className={cn(
            "mr-2 h-2 w-2 rounded-full transition-colors duration-200",
            isMatching ? "bg-green-600" : "bg-red-500"
          )}
        />
        <span>{isMatching ? "Passwords match" : "Passwords do not match"}</span>
        {isMatching && (
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
    </div>
  );
};
