'use client';
import { RiHomeLine } from 'react-icons/ri';
import { useTranslations } from 'next-intl';
import '../style/BannerSignUp.css';

// interface BannerProps {
//   titleKey: string;
// }

export default function BannerResetPassword() {
  const t = useTranslations('resetPasswordBanner');

  return (
    <div className="banner">
      <div className="banner-content">
        <div className="banner-icon">
          <RiHomeLine size={30} className="home-icon" />
          |
          <p>{t('title-reset')}</p>
        </div>
        <div className="banner-title">
          <h1>{t('title-reset')}</h1>
        </div>
      </div>
    </div>
  );
}
