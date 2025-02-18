'use client';
import { RiShoppingCartLine } from 'react-icons/ri';
import '../style/BannerSignUp.css';
// import { useTranslations } from "next-intl";
interface BannerProps {
    title: string;
    subtitle: string; // Đổi tên từ "title-1" thành "subtitle" để hợp lệ
}
export default function Banner({title ,subtitle }: BannerProps) {

  return (
    <div className="banner">
      <div className="banner-content">
        <div className="banner-icon">
          <RiShoppingCartLine size={30} className="cart-icon" />
                    |
          <p>{title}</p> {/* Ưu tiên title từ props, nếu không thì lấy từ dịch */}
        </div>
        <div className="banner-title">
          <h1>{subtitle}</h1>
        </div>
      </div>
    </div>
  );
}
