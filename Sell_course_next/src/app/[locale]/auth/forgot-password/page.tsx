"use client";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useTheme } from "../../../../contexts/ThemeContext";
import { useRouter } from "next/navigation";
import "@/style/Login.css";
import Banner from "@/components/Banner-ForgotPassword";
import { sendMail } from "@/app/api/auth/forgot/forgot";
import { send } from "process";
import MailGun from "next-auth/providers/mailgun";
export default function ForgotPassword() {
  const t = useTranslations("forgotPasswordPage"); // Tải bản dịch
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
      const response = await sendMail(email, localActive);
      if (response && response.statusCode === 200) {
        setSuccessMessage(t("emailSent"));
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
