'use client';
import { RiHomeLine } from 'react-icons/ri';
import '../style/BannerSignUp.css';
// import { useTranslations } from "next-intl";
interface BannerProps {
    title: string;
}
export default function Banner({title}: BannerProps) {

  return (
    <div className="banner">
      <div className="banner-content">
        <div className="banner-icon">
          <RiHomeLine size={30} className="home-icon" />
                    |
          <p>{title}</p> {/* Ưu tiên title từ props, nếu không thì lấy từ dịch */}
        </div>
        <div className="banner-title">
          <h1>{title}</h1>
        </div>
      </div>
    </div>
  );
}
