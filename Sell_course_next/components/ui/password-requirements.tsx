"use client";

import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

interface PasswordRequirementsProps {
  password: string;
  showRequirements?: boolean;
}

export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
  password,
  showRequirements = true,
}) => {
  const requirements = [
    {
      test: (pwd: string) => pwd.length >= 8,
      text: "At least 8 characters long",
      id: "length"
    },
    {
      test: (pwd: string) => /[A-Z]/.test(pwd),
      text: "Contains at least one uppercase letter (A-Z)",
      id: "uppercase"
    },
    {
      test: (pwd: string) => /[a-z]/.test(pwd),
      text: "Contains at least one lowercase letter (a-z)",
      id: "lowercase"
    },
    {
      test: (pwd: string) => /[0-9]/.test(pwd),
      text: "Contains at least one number (0-9)",
      id: "number"
    },
    {
      test: (pwd: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
      text: "Contains at least one special character (!@#$%^&*)",
      id: "special"
    }
  ];

  if (!showRequirements) return null;

  return (
    <div className="mt-2 space-y-2">
      <p className="text-xs font-medium text-gray-700">Password must contain:</p>
      <div className="space-y-1">
        {requirements.map((requirement) => {
          const isValid = requirement.test(password);
          return (
            <div key={requirement.id} className="flex items-center gap-2 text-xs">
              {isValid ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <XCircle className="h-3 w-3 text-gray-400" />
              )}
              <span
                className={`${
                  isValid 
                    ? "text-green-600 font-medium"
                    : "text-gray-600"
                }`}
              >
                {requirement.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const getPasswordStrength = (password: string): {
  score: number;
  text: string;
  color: string;
} => {
  const requirements = [
    (pwd: string) => pwd.length >= 8,
    (pwd: string) => /[A-Z]/.test(pwd),
    (pwd: string) => /[a-z]/.test(pwd),
    (pwd: string) => /[0-9]/.test(pwd),
    (pwd: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)
  ];

  const score = requirements.reduce((acc, test) => acc + (test(password) ? 1 : 0), 0);

  if (score === 0) return { score: 0, text: "", color: "" };
  if (score <= 2) return { score, text: "Weak", color: "text-red-500" };
  if (score <= 3) return { score, text: "Medium", color: "text-yellow-500" };
  if (score <= 4) return { score, text: "Strong", color: "text-blue-500" };
  return { score, text: "Very Strong", color: "text-green-500" };
};

export const PasswordStrengthIndicator: React.FC<{ password: string }> = ({ password }) => {
  const strength = getPasswordStrength(password);
  
  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600">Password strength:</span>
        <span className={`text-xs font-medium ${strength.color}`}>
          {strength.text}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all duration-300 ${
            strength.score <= 2 ? 'bg-red-500' :
            strength.score <= 3 ? 'bg-yellow-500' :
            strength.score <= 4 ? 'bg-blue-500' : 'bg-green-500'
          }`}
          style={{ width: `${(strength.score / 5) * 100}%` }}
        />
      </div>
    </div>
  );
};

interface PasswordMatchIndicatorProps {
  password: string;
  confirmPassword: string;
  showIndicator?: boolean;
}

export const PasswordMatchIndicator: React.FC<PasswordMatchIndicatorProps> = ({
  password,
  confirmPassword,
  showIndicator = true
}) => {
  if (!showIndicator || !confirmPassword) return null;

  const passwordsMatch = password === confirmPassword;
  const isEmpty = !password || !confirmPassword;

  if (isEmpty) return null;

  return (
    <div className={`mt-2 p-2 rounded-md border transition-all duration-200 ${
      passwordsMatch 
        ? 'bg-green-50 border-green-200' 
        : 'bg-red-50 border-red-200'
    }`}>
      <div className="flex items-center gap-2">
        {passwordsMatch ? (
          <>
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span className="text-xs text-green-700 font-medium">
              Passwords match perfectly
            </span>
          </>
        ) : (
          <>
            <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <span className="text-xs text-red-700 font-medium">
              Passwords do not match
            </span>
          </>
        )}
      </div>
    </div>
  );
};