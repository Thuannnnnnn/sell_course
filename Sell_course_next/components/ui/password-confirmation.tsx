"use client";

import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

interface PasswordConfirmationProps {
  password: string;
  confirmPassword: string;
  showValidation?: boolean;
}

export const PasswordConfirmation: React.FC<PasswordConfirmationProps> = ({
  password,
  confirmPassword,
  showValidation = true,
}) => {
  if (!showValidation || !confirmPassword) return null;

  const isMatching = password === confirmPassword;
  const hasContent = confirmPassword.length > 0;

  return (
    <div className="mt-2">
      {hasContent && (
        <div className="flex items-center gap-2 text-xs">
          {isMatching ? (
            <CheckCircle className="h-3 w-3 text-green-500" />
          ) : (
            <XCircle className="h-3 w-3 text-red-500" />
          )}
          <span
            className={`${
              isMatching 
                ? "text-green-600" 
                : "text-red-600"
            }`}
          >
            {isMatching ? "Passwords match" : "Passwords do not match"}
          </span>
        </div>
      )}
    </div>
  );
};

export const validatePasswordMatch = (password: string, confirmPassword: string): {
  isValid: boolean;
  message: string;
} => {
  if (!confirmPassword) {
    return { isValid: false, message: "Please confirm your password" };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, message: "Passwords do not match" };
  }
  
  return { isValid: true, message: "Passwords match" };
};