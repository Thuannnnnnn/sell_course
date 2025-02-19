"use client";
import { RiHomeLine } from "react-icons/ri";
import '../../style/BannerSignUp.css';

interface CourseInfoBannerProps {
    title: string;
    subtitle: string;
}

export default function CourseInfoBanner({ title, subtitle }: CourseInfoBannerProps) {
    return (
        <div className="banner">
            <div className="banner-content">
                <div className="banner-icon">
                    <RiHomeLine size={30} className="home-icon" />
                    |
                    <p>{title}</p>
                </div>
                <div className="banner-title">
                    <h1>{subtitle}</h1>
                </div>
            </div>
        </div>
    );
}
