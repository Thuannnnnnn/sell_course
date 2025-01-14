'use client';
import { signIn } from "next-auth/react"
import { RiHomeLine } from 'react-icons/ri';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useTheme } from '../../../../contexts/ThemeContext';
export default function SignIn() {

  const t = useTranslations('loginPage');
  const { theme } = useTheme();
  const handleGoogleSignIn = async () => {
    try {
      const response = await signIn("google", { redirect: false });
      console.log("Google Sign-In Response:", response);

      if (response?.ok) {
        console.log("Login successful! User data:", response);
      } else {
        console.error("Login failed:", response?.error);
      }
    } catch (error) {
      console.error("Error during Google Sign-In:", error);
    }
  };
  return (
    <div className={`login ${theme}`}>
      <div className="banner-login">
        <span>
          <RiHomeLine className="banner-logo" />
          <span className="banner-text"> | {t('title')}</span>
        </span>
        <div>
          <h1 className="title">{t('title')}</h1>
        </div>
      </div>
      <div className="login-box">
        <h2>{t('wellcome')}</h2>
        <div className="register">
          <span>{t('DontHaveAccount')}</span>
          <Link href={`/#`} className="nav-link me-4">
            {t('Register')}
          </Link>
        </div>
        <div className="input-container">
          <label htmlFor="inputEmail">{t('email')}</label>
          <input
            id="inputEmail"
            type="email"
            placeholder={t('placeholderEmail')}
            className="input-field"
          />
        </div>
        <div className="input-container">
          <label htmlFor="inputPassword">{t('password')}</label>
          <input
            id="inputPassword"
            type="password"
            placeholder={t('placeholderPassword')}
            className="input-field"
          />
        </div>
        <div className="forgotPw">
          <Link href={`/#`} className="nav-link me-4">
            {t('forgot')}
          </Link>
        </div>
        <div className="groupButton">
          <button type="button" className="submit-button sign-in-button">
            {t('login')}
          </button>
        </div>
        <button onClick={handleGoogleSignIn}>Sign In with Google</button>
        {/* <form action={handleGoogleSignIn} className="formGoogle">
          <button type="submit" className="submit-button">
            {t('google')}
          </button>
        </form> */}
      </div>
    </div>
  );
}
