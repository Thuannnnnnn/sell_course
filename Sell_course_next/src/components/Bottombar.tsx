'use client';
import React from 'react';
import '../style/Sidebar.css';
import { IoMdHome } from 'react-icons/io';
import { useLocale, useTranslations } from 'next-intl';
import { useTheme } from '@/context/ThemeContext';
import Link from 'next/link';

const BottomBar = () => {
    const localActive = useLocale();
    const t = useTranslations('sidebar');
    const { theme } = useTheme();
    return (
        <>
                <div className={`bottom-tab-navbar bg-${theme}`}>
                    <ul className="nav justify-content-between w-100">
                        <li className="nav-item d-flex flex-column align-items-center">
                        <Link href={`/${localActive}/`} className={`text-decoration-none side-${theme}`}>
                            <IoMdHome size={25} />
                            <p className="fw-semibold mt-2 page">{t('home')}</p>
                        </Link>
                        </li>
                        <li className="nav-item d-flex flex-column align-items-center">
                        <Link href={`/${localActive}/`} className={`text-decoration-none side-${theme}`}>
                            <IoMdHome size={25} />
                            <p className="fw-semibold mt-2 page">{t('home')}</p>
                        </Link>
                        </li>
                    </ul>
                </div>
        </>
    );
};
export default BottomBar;
