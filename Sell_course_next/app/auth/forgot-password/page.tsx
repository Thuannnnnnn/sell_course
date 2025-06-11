"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import PageHead from "@/components/layout/Head";
import {
  forgotPasswordAPI,
  verifyOtp,
  resetPasswordAPI,
} from "@/app/api/auth/forgot-password/forgot-password";

const ForgotPWPage = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<
    "email" | "otp" | "resetPassword" | "success"
  >("email");

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      const response = await forgotPasswordAPI(email);
      setSuccess(response.message);
      setStep("otp");
    } catch {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      setIsLoading(false);
      return;
    }

    try {
      const response = await verifyOtp(email, otp);
      if (response.verified) {
        setStep("resetPassword");
      } else {
        setError("Invalid OTP. Please try again.");
      }
    } catch {
      setError("Failed to verify OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!password || !confirmPassword) {
      setError("Both password fields are required");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const response = await resetPasswordAPI(email, password, otp);
      setSuccess(response.message);
      setStep("success");
    } catch {
      setError("Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailStep = () => (
    <form onSubmit={handleEmailSubmit} className="space-y-4">
      {error && (
        <div className="text-sm text-red-500 text-center bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium leading-none">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Sending OTP..." : "Send OTP"}
      </Button>
    </form>
  );

  const renderOtpStep = () => (
    <form onSubmit={handleOtpSubmit} className="space-y-4">
      {success && (
        <div className="text-sm text-green-600 text-center bg-green-50 p-2 rounded">
          {success}
        </div>
      )}
      {error && (
        <div className="text-sm text-red-500 text-center bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <label htmlFor="otp" className="text-sm font-medium leading-none">
          OTP
        </label>
        <Input
          id="otp"
          type="text"
          placeholder="123456"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
          className="text-center text-lg tracking-widest"
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Verifying..." : "Verify OTP"}
      </Button>
    </form>
  );

  const renderResetPasswordStep = () => (
    <form onSubmit={handlePasswordSubmit} className="space-y-4">
      {error && (
        <div className="text-sm text-red-500 text-center bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium leading-none">
          New Password
        </label>
        <Input
          id="password"
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-medium leading-none"
        >
          Confirm Password
        </label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Resetting Password..." : "Reset Password"}
      </Button>
    </form>
  );

  const renderSuccessStep = () => (
    <div className="space-y-4 text-center">
      <div className="text-green-600">
        <svg
          className="mx-auto h-12 w-12"
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
      </div>
      {success && (
        <div className="text-sm text-green-600 bg-green-50 p-3 rounded">
          {success}
        </div>
      )}
      <Button
        onClick={() => (window.location.href = "/auth/login")}
        className="w-full"
      >
        Go to Login
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted/50">
      <PageHead
        title="Forgot Password"
        description="Reset your CourseMaster account password"
      />
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex flex-col items-center space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              {step === "email" && "Forgot Password"}
              {step === "otp" && "Verify OTP"}
              {step === "resetPassword" && "Reset Password"}
              {step === "success" && "Success!"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {step === "email" &&
                "Enter your email to receive a password reset link"}
              {step === "otp" && "Enter the OTP sent to your email"}
              {step === "resetPassword" && "Enter your new password"}
              {step === "success" &&
                "Your password has been reset successfully"}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {step === "email" && renderEmailStep()}
          {step === "otp" && renderOtpStep()}
          {step === "resetPassword" && renderResetPasswordStep()}
          {step === "success" && renderSuccessStep()}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPWPage;
