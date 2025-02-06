"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useTheme } from "../../../../contexts/ThemeContext";
import { useRouter, useSearchParams } from "next/navigation";
import Banner from "@/components/Banner-ResetPassword";
import "@/style/Login.css";
import { resetPassword } from "@/app/api/auth/forgot/forgot";

export default function ResetPassword() {
  const t = useTranslations("resetPasswordPage");
  const { theme } = useTheme();
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) return t("passwordTooShort"); // Min 8 characters
    if (!/[A-Z]/.test(password)) return t("passwordNoUppercase"); // At least 1 uppercase
    if (!/[a-z]/.test(password)) return t("passwordNoLowercase"); // At least 1 lowercase
    if (!/[0-9]/.test(password)) return t("passwordNoNumber"); // At least 1 number
    if (!/[\W_]/.test(password)) return t("passwordNoSpecial"); // At least 1 special character
    return null;
  };

  const handleResetPassword = async () => {
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    // **Validation**
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      setIsLoading(false);
      return;
    }

    try {
      const response = await resetPassword(email, password, token);
      if (response && response.statusCode === 200) {
        setSuccessMessage(t("passwordResetSuccess"));
        setTimeout(() => router.push(`/${locale}/auth/login`), 3000);
      } else {
        setError(t("serverError"));
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setError(t("serverError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`login ${theme === "dark" ? "dark-bg" : ""}`}>
      <Banner titleKey="title-reset" />
      <div className="login-box">
        <h2 className="title">{t("title")}</h2>

        {/* Password Input */}
        <div className="input-container">
          <label htmlFor="inputPassword">{t("newPassword")}</label>
          <input
            id="inputPassword"
            type="password"
            placeholder={t("placeholderPassword")}
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Confirm Password Input */}
        <div className="input-container">
          <label htmlFor="inputConfirmPassword">{t("confirmPassword")}</label>
          <input
            id="inputConfirmPassword"
            type="password"
            placeholder={t("placeholderConfirmPassword")}
            className="input-field"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {/* Error Message */}
        {error && <p className="error-message">{error}</p>}

        {/* Success Message */}
        {successMessage && <strong className="success-message">{successMessage}</strong>}

        {/* Submit Button */}
        <div className="groupButton">
          <button
            type="button"
            className="submit-button"
            onClick={handleResetPassword}
            disabled={isLoading}
          >
            {isLoading ? t("loading") : t("resetPassword")}
          </button>
        </div>

        {/* Login Link */}
        <div className="register">
          <span>{t("rememberedPassword")}</span>
          <Link href={`/${locale}/auth/login`}>{t("login")}</Link>
        </div>
      </div>
    </div>
  );
}
