'use client';
import { signIn } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useState } from 'react';
import PageLoader from '@/components/PageLoader';
import '@/style/Login.css';
import Banner from '@/components/Banner-SignUp';

export default function SignIn() {
  const t = useTranslations('loginPage');
  const localActive = useLocale();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: '',
  });
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const tl = useTranslations('signUpBanner');

  const validateEmail = (email: string) => {
    if (!email) {
      return 'Email is required';
    }
    if (!email.includes('@')) {
      return 'Email must contain @';
    }
    if (!email.includes('.')) {
      return 'Email must contain domain (e.g., .com)';
    }
    if (email.indexOf('@') !== email.lastIndexOf('@')) {
      return 'Email cannot contain multiple @ symbols';
    }
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      return 'Invalid email format';
    }
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    if (password.length > 30) {
      return 'Password must not exceed 30 characters';
    }
    if (/[<>{}()']/.test(password)) {
      return 'Password contains invalid special characters';
    }
    return '';
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setErrors((prev) => ({
      ...prev,
      email: validateEmail(newEmail),
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setErrors((prev) => ({
      ...prev,
      password: validatePassword(newPassword),
    }));
  };

  const handleGoogleSignIn = async () => {
    setIsLoadingPage(true);
    try {
      const response = await signIn('google', {
        redirect: false,
        callbackUrl: '/',
      });

      if (response?.error === 'AccessDenied') {
        return;
      } else if (response?.ok) {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error during Google Sign-In:', error);
      setErrors((prev) => ({
        ...prev,
        general: 'Google sign-in error',
      }));
    } finally {
      setIsLoadingPage(false);
    }
  };

  const handleSignIn = async () => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    setErrors({
      email: emailError,
      password: passwordError,
      general: '',
    });

    if (emailError || passwordError) {
      return;
    }

    setIsLoadingPage(true);
    try {
      const response = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      console.log('SignIn Response:', response);
      if (response?.ok && !response.error) {
        setIsLoggedIn(true);
      } else {
        setErrors((prev) => ({
          ...prev,
          general: 'Invalid email or password',
        }));
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error in handleSignIn:', error);
      setErrors((prev) => ({
        ...prev,
        general: 'Failed to connect to the server',
      }));
      setIsLoggedIn(false);
    } finally {
      setIsLoadingPage(false);
    }
  };

  if (isLoggedIn) {
    console.log('User is logged in, redirecting to dashboard...');
    return <PageLoader rediecrectPath="/" delay={1000} />;
  }

  return (
    <div className={`login ${theme === 'dark' ? 'dark-bg' : ''}`}>
      <Banner title={tl('title-2')} />
      <div className="login-box">
        <h2 className="title">{t('wellcome')}</h2>
        {errors.general && <p className="error-message">{errors.general}</p>}
        <div className="register">
          <span>{t('DontHaveAccount')}</span>
          <Link href="/register">{t('Register')}</Link>
        </div>
        <div className="input-container">
          <label htmlFor="inputEmail">{t('email')}</label>
          <input
            id="inputEmail"
            type="email"
            placeholder={t('placeholderEmail')}
            className={`input-field ${errors.email ? 'error-input' : ''}`}
            value={email}
            onChange={handleEmailChange}
          />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>
        <div className="input-container">
          <label htmlFor="inputPassword">{t('password')}</label>
          <input
            id="inputPassword"
            type="password"
            placeholder={t('placeholderPassword')}
            className={`input-field ${errors.password ? 'error-input' : ''}`}
            value={password}
            onChange={handlePasswordChange}
          />
          {errors.password && <p className="field-error">{errors.password}</p>}
        </div>
        <div className="forgotPw">
          <Link href={`/${localActive}/auth/forgot-password`}>{t('forgot')}</Link>
        </div>
        <div className="groupButton">
          <button
            type="button"
            className="submit-button"
            onClick={handleSignIn}
            disabled={isLoadingPage}
          >
            {t('login')}
          </button>
        </div>
        <button onClick={handleGoogleSignIn} className="google-sign-in-button">
          {t('google')}
        </button>
      </div>
    </div>
  );
}
