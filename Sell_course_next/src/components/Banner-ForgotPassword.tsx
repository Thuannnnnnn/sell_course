"use client";
import { RiHomeLine } from "react-icons/ri";
import { useTranslations } from "next-intl";
import "../style/BannerSignUp.css";

interface BannerProps {
  titleKey: string; // Nhận key thay vì text trực tiếp
}

export default function Banner({ titleKey }: BannerProps) {
  const t = useTranslations("forgotPasswordBanner"); // Đổi sang đúng namespace

  return (
    <div className="banner">
      <div className="banner-content">
        <div className="banner-icon">
          <RiHomeLine size={30} className="home-icon" />
          |
          <p>{t(titleKey)}</p>
        </div>
        <div className="banner-title">
          <h1>{t(titleKey)}</h1>
        </div>
      </div>
    </div>
  );
}
