'use client';
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useTheme } from '../../../../contexts/ThemeContext';
import '@/style/Login.css';
import Banner from '@/components/Banner-ForgotPassword';
import { sendMail } from '@/app/api/auth/forgot/forgot';

export default function ForgotPassword() {
  const t = useTranslations('forgotPasswordPage');
  const { theme } = useTheme();
  const localActive = useLocale();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [showRetryMessage, setShowRetryMessage] = useState(false);

  // Hàm kiểm tra email hợp lệ
  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleResetPassword = async () => {
    if (!validateEmail(email)) {
      setError(t('errorMessage')); // Email không hợp lệ
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    setCanResend(false);
    setShowRetryMessage(false);
    try {
      const response = await sendMail(email, localActive);
      if (response && response.statusCode === 200) {
        setSuccessMessage(t('emailSent'));
        setTimeout(() => setShowRetryMessage(true), 30000); // Hiển thị gợi ý sau 30s
      } else {
        setError(t('emailNotFound')); // Nếu API trả về lỗi
        setCanResend(true);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      if (error instanceof Error && error.message.includes('Email not found')) {
        setError(t('emailNotFound')); // Hiển thị lỗi nếu email không tồn tại
      } else {
        setError(t('serverError')); // Lỗi hệ thống
      }
      setCanResend(true);
    } finally {
      setIsLoading(false);
      setTimeout(() => setCanResend(true), 30000); // Cho phép gửi lại sau 30s
    }
  };

  return (
    <div className={`login ${theme === 'dark' ? 'dark-bg' : ''}`}>
      <Banner titleKey="title-3" />
      <div className="login-box">
        <h2 className="title">{t('title')}</h2>
        <div className="register">
          <span>{t('rememberedPassword')}</span>
          <Link href={`/${localActive}/auth/login`}>{t('login')}</Link>
        </div>
        <div className="input-container">
          <label htmlFor="inputEmail">{t('email')}</label>
          <input
            id="inputEmail"
            type="email"
            placeholder={t('placeholderEmail')}
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        {successMessage && <strong className="success-message">{successMessage}</strong>}
        {/* Hiển thị gợi ý sau 30s */}
        {showRetryMessage && (
          <p className="info-message">{t('emailNotReceived')}</p>
        )}

        <div className="groupButton">
          <button
            type="button"
            className="submit-button"
            onClick={handleResetPassword}
            disabled={isLoading || !canResend}
          >
            {isLoading ? t('loading') : t('resetPassword')}
          </button>
        </div>
      </div>
    </div>
  );
}
