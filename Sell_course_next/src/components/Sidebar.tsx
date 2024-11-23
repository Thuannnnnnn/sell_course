'use client';
import React from 'react';
import '../style/Sidebar.css';
import { IoMdHome } from 'react-icons/io';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';

const SidebarNavbar = () => {
    const localActive = useLocale();
    const t = useTranslations('sidebar');
    const { theme } = useTheme();
    return (
        <>
                <div className={`sidebar-navbar bg-${theme}`}>
                    <ul className="nav flex-column">
                        <li className="nav-item d-flex flex-column align-items-center mb-4">
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

export default SidebarNavbar;
