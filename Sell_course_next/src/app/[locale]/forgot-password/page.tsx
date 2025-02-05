"use client";
import { useState } from "react";
import {useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useTheme } from "../../../../src/contexts/ThemeContext";
import { useRouter } from "next/navigation";
import "@/style/Login.css";
import Banner from "@/components/Banner-ForgotPassword";

export default function ForgotPassword() {
  const t = useTranslations("forgotPasswordPage"); // Tải bản dịch
  const tl = useTranslations("signUpBanner"); // Tiêu đề banner
  const { theme } = useTheme();
  const localActive = useLocale();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleResetPassword = async () => {
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMessage(t("successMessage"));
        setTimeout(() => router.push("/login"), 3000);
      } else {
        setError(data.message || t("errorMessage"));
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
      <Banner titleKey="title-3" />
      <div className="login-box">
        <h2 className="title">{t("title")}</h2>
        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
        <div className="register">
          <span>{t("rememberedPassword")}</span>
          <Link href={`/${localActive}/auth/login`}>{t("login")}</Link>
        </div>
        <div className="input-container">
          <label htmlFor="inputEmail">{t("email")}</label>
          <input
            id="inputEmail"
            type="email"
            placeholder={t("placeholderEmail")}
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
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
      </div>
    </div>
  );
}
