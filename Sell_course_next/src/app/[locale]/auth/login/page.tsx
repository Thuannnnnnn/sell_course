"use client"; // Đảm bảo rằng đây là một client-side component
import { signIn } from "next-auth/react";
import { RiHomeLine } from "react-icons/ri";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useTheme } from "../../../../contexts/ThemeContext";
import { useState } from "react";
import { useRouter } from "next/navigation";
import loginUser from "@/app/api/auth/Login/route";

export default function SignIn() {
  const t = useTranslations("loginPage");
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const [isLoadingPage, setIsLoadingPage] = useState(false);

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
      const response = await loginUser(email, password);
      if (response) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error in handleSignIn:", error);
      setError("Failed to connect to the server");
    } finally {
      setIsLoadingPage(false);
    }
  };

  return (
    <div className={`login ${theme}`}>
      <div className="banner-login">
        <span>
          <RiHomeLine className="banner-logo" />
          <span className="banner-text"> | {t("title")}</span>
        </span>
        <div>
          <h1 className="title">{t("title")}</h1>
        </div>
      </div>
      <div className="login-box">
        <h2>{t("wellcome")}</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="register">
          <span>{t("DontHaveAccount")}</span>
          <Link href="/register" className="nav-link me-4">
            {t("Register")}
          </Link>
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
          <Link href="/forgot-password" className="nav-link me-4">
            {t("forgot")}
          </Link>
        </div>
        <div className="groupButton">
          <button
            type="button"
            className="submit-button sign-in-button"
            onClick={handleSignIn}
            disabled={isLoadingPage}
          >
            {isLoadingPage ? "Loading..." : t("login")}
          </button>
        </div>
        <button onClick={handleGoogleSignIn} className="google-sign-in-button">
          Sign In with Google
        </button>
      </div>
    </div>
  );
}

// "use client"; // Ensure this is a client-side component
// import { signIn } from "next-auth/react";
// import { RiHomeLine } from "react-icons/ri";
// import { useTranslations } from "next-intl";
// import Link from "next/link";
// import { useTheme } from "../../../../contexts/ThemeContext";
// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import loginUser from "@/app/api/auth/Login/route";

// export default function SignIn() {
//   const t = useTranslations("loginPage");
//   const { theme } = useTheme();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const router = useRouter();
//   const [isLoadingPage, setIsLoadingPage] = useState(false);

//   const handleGoogleSignIn = async () => {
//     try {
//       const response = await signIn("google", { redirect: false });
//       if (response?.ok) {
//         console.log("Login successful! User data:", response);
//         router.push("/dashboard");
//       } else {
//         console.error("Login failed:", response?.error);
//         setError("Google sign-in failed");
//       }
//     } catch (error) {
//       console.error("Error during Google Sign-In:", error);
//       setError("Google sign-in error");
//     }
//   };

//   const handleSignIn = async () => {
//     setIsLoadingPage(true);
//     try {
//       const response = await loginUser(email, password);
//       if (response) {
//         router.push("/dashboard");
//       }
//     } catch (error) {
//       console.error("Error in handleSignIn:", error);
//       setError("Failed to connect to the server");
//     } finally {
//       setIsLoadingPage(false);
//     }
//   };

//   return (
//     <div className={`login ${theme}`}>
//       <div className="banner-login">
//         <span>
//           <RiHomeLine className="banner-logo" />
//           <span className="banner-text"> | {t("title")}</span>
//         </span>
//         <div>
//           <h1 className="title">{t("title")}</h1>
//         </div>
//       </div>
//       <div className="login-box">
//         <h2>{t("wellcome")}</h2>
//         {error && <p className="error-message">{error}</p>}
//         <div className="register">
//           <span>{t("DontHaveAccount")}</span>
//           <Link href="/register" className="nav-link me-4">
//             {t("Register")}
//           </Link>
//         </div>
//         <div className="input-container">
//           <label htmlFor="inputEmail">{t("email")}</label>
//           <input
//             id="inputEmail"
//             type="email"
//             placeholder={t("placeholderEmail")}
//             className="input-field"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//           />
//         </div>
//         <div className="input-container">
//           <label htmlFor="inputPassword">{t("password")}</label>
//           <input
//             id="inputPassword"
//             type="password"
//             placeholder={t("placeholderPassword")}
//             className="input-field"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//           />
//         </div>
//         <div className="forgotPw">
//           <Link href="/forgot-password" className="nav-link me-4">
//             {t("forgot")}
//           </Link>
//         </div>
//         <div className="groupButton">
//           <button
//             type="button"
//             className="submit-button sign-in-button"
//             onClick={handleSignIn}
//             disabled={isLoadingPage}
//           >
//             {isLoadingPage ? "Loading..." : t("login")}
//           </button>
//         </div>
//         <button onClick={handleGoogleSignIn} className="google-sign-in-button">
//           Sign In with Google
//         </button>
//       </div>
//     </div>
//   );
// }

