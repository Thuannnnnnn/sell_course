"use client"; // Đảm bảo rằng đây là một client-side component
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useTheme } from "../../../../contexts/ThemeContext";
import { useState } from "react";
import { useRouter } from "next/navigation";
import loginUser from "@/app/api/auth/Login/route";
import PageLoader from "@/components/PageLoader";
import "@/style/Login.css";
import Banner from "@/components/Banner-SignUp";

export default function SignIn() {
  const t = useTranslations("loginPage");
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const tl = useTranslations("signUpBanner");

  const handleGoogleSignIn = async () => {
    try {
      const response = await signIn("google", { redirect: false });
      if (response?.ok) {
        console.log("Login successful! User data:", response);
        router.push("/dashboard");
      } else {
        console.error("Login failed:", response?.error);
        setError("Google sign-in failed");
      }
    } catch (error) {
      console.error("Error during Google Sign-In:", error);
      setError("Google sign-in error");
    }
  };

  const handleSignIn = async () => {
    setIsLoadingPage(true);
    try {
      const response = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      console.log("SignIn Response:", response);
      if (response?.ok && !response.error) {
        setIsLoggedIn(true);
      } else {
        alert("sai nè ông cố")
        setError(response?.error || "Invalid email or password");
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("Error in handleSignIn:", error);
      setError("Failed to connect to the server");
      setIsLoggedIn(false);
    } finally {
      setIsLoadingPage(false);
    }
  };

  if (isLoggedIn) {
    console.log("User is logged in, redirecting to dashboard...");
    return <PageLoader rediecrectPath="/" delay={2000} />;
  }

  return (
    <div className={`login ${theme === "dark" ? "dark-bg" : ""}`}>
      <Banner title={tl("title-2")} />
      <div className="login-box">
        <h2 className="title">{t("wellcome")}</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="register">
          <span>{t("DontHaveAccount")}</span>
          <Link href="/register">{t("Register")}</Link>
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
        <div className="input-container">
          <label htmlFor="inputPassword">{t("password")}</label>
          <input
            id="inputPassword"
            type="password"
            placeholder={t("placeholderPassword")}
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="forgotPw">
          <Link href="/forgot-password">{t("forgot")}</Link>
        </div>
        <div className="groupButton">
          <button
            type="button"
            className="submit-button"
            onClick={handleSignIn}
            disabled={isLoadingPage}
          >
            {t("login")}
          </button>
        </div>
        <button onClick={handleGoogleSignIn} className="google-sign-in-button">
          {t("google")}
        </button>
      </div>
    </div>
  );
}
