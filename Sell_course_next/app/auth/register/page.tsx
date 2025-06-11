"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { authApi, ApiError } from "@/app/api/auth/register/register";
import { OtpData } from "@/app/types/auth/Register/otp";
import { FormData } from "@/app/types/auth/Register/register";
import PageHead from "@/components/layout/Head";
import logo from "@/public/logo.png";
import Image from "next/image";
export default function RegisterPage() {
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [step, setStep] = useState<"form" | "otp" | "success">("form");
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [otpData, setOtpData] = useState<OtpData>({
    email: "",
    otp_code: "",
  });
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/\D/g, "").slice(0, 6);
    setOtpData((prev) => ({
      ...prev,
      otp_code: numericValue,
    }));
  };
  const handleSendOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);
    // check form validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }
    if (!/[A-Z]/.test(formData.password)) {
      setError("Password must contain at least one uppercase letter");
      setIsLoading(false);
      return;
    }

    if (!formData.fullName.trim()) {
      setError("Please enter your full name");
      setIsLoading(false);
      return;
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      await authApi.sendVerificationOtp(formData.email);
      setOtpData({ email: formData.email, otp_code: "" });
      setStep("otp");
      setSuccess("OTP sent to your email. Please check your inbox.");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to send OTP. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndRegister = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (otpData.otp_code.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      setIsLoading(false);
      return;
    }

    try {
      const userData = {
        email: otpData.email,
        otp_code: otpData.otp_code,
        username: formData.fullName,
        password: formData.password,
      };

      const result = await authApi.registerWithOtp(userData);
      setStep("success");
      setSuccess(`Registration successful! Welcome ${result.username}!`);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    setError("");
    setIsLoading(true);

    try {
      await authApi.resendOtp(otpData.email);
      setSuccess("New OTP sent to your email.");

      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to resend OTP. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToForm = () => {
    setStep("form");
    setOtpData({ email: "", otp_code: "" });
    setError("");
    setSuccess("");
  };

  const handleGoogleRegister = () => {
    console.log("Google registration attempted");
  };

  const renderFormStep = () => (
    <form onSubmit={handleSendOtp} className="space-y-4">
      {error && (
        <div className="text-sm text-red-500 text-center bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <label htmlFor="fullName" className="text-sm font-medium leading-none">
          Full Name
        </label>
        <Input
          id="fullName"
          name="fullName"
          placeholder="John Doe"
          value={formData.fullName}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium leading-none">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="john@example.com"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium leading-none">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleInputChange}
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
          name="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Sending OTP..." : "Send OTP"}
      </Button>
    </form>
  );

  const renderOtpStep = () => (
    <div className="space-y-4">
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

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          We sent a 6-digit code to <strong>{otpData.email}</strong>
        </p>
      </div>

      <form onSubmit={handleVerifyAndRegister} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="otp" className="text-sm font-medium leading-none">
            Enter OTP Code
          </label>
          <Input
            id="otp"
            name="otp"
            type="text"
            placeholder="123456"
            value={otpData.otp_code}
            onChange={handleOtpChange}
            maxLength={6}
            className="text-center text-lg tracking-widest"
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Verifying..." : "Verify & Register"}
        </Button>
      </form>

      <div className="flex justify-between items-center text-sm">
        <Button
          type="button"
          variant="ghost"
          onClick={handleBackToForm}
          disabled={isLoading}
        >
          ← Back to form
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={handleResendOtp}
          disabled={isLoading || resendCooldown > 0}
        >
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
        </Button>
      </div>
    </div>
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

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Registration Complete!</h3>
        <p className="text-sm text-muted-foreground">
          Your account has been created successfully. You can now sign in.
        </p>
      </div>

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
        title="Register"
        description="Create your account to start learning with EduLearn"
      />
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex flex-col items-center space-y-2 text-center">
            <div className="flex items-center gap-2">
              <Image src={logo} alt="Logo" width={80} height={80} />
              <span className="text-2xl font-bold">Course Master</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {step === "form" && "Create an account"}
              {step === "otp" && "Verify your email"}
              {step === "success" && "Welcome!"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {step === "form" && "Enter your details to create your account"}
              {step === "otp" && "Enter the OTP code sent to your email"}
              {step === "success" && "Your registration is complete"}
            </p>
          </div>
        </CardHeader>

        <CardContent>
          {step === "form" && renderFormStep()}
          {step === "otp" && renderOtpStep()}
          {step === "success" && renderSuccessStep()}

          {step === "form" && (
            <>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                type="button"
                className="w-full"
                onClick={handleGoogleRegister}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </Button>
            </>
          )}
        </CardContent>

        {step === "form" && (
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <a
                href="/auth/login"
                className="text-primary underline-offset-4 hover:underline"
              >
                Sign in
              </a>
            </p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
