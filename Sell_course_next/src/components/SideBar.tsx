'use client'; // Đảm bảo rằng component này chạy trên client

import { useEffect, useState } from "react";
import "../style/AdminSideBar.css";
import { MdDashboard } from "react-icons/md";
import { HiUserGroup } from "react-icons/hi2";
import { FaCircleQuestion } from "react-icons/fa6";
import { MdQuiz } from "react-icons/md";
import { SiCoursera } from "react-icons/si";
import { BiSolidCategory } from "react-icons/bi";
import { TbMessageReportFilled } from "react-icons/tb";
import { FaBell, FaWallet } from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";
import { FaSignOutAlt } from "react-icons/fa";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { SiWebauthn } from "react-icons/si";
import { usePathname } from "next/navigation";
const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const t = useTranslations('dashBoard');
  const locate = useLocale();
  const pathname = usePathname();
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const isActive = (path: string) => {
    return pathname === path ? 'active' : '';
  };
  return (
    <div className={`sidebar-container ${isOpen ? 'open' : 'closed'}`}>
      <button className="toggle-btn" onClick={toggleSidebar}>
        {isOpen ? '☰' : '→'}
      </button>
      <div className="sidebar">
        <ul>
          <li className={isActive(`/${locate}/admin/dashboard`)}>
            <Link href={`/${locate}/admin/dashboard`} className="sidebar-link">
              <div className="icon-sidebar">
                <MdDashboard />
              </div>
              <div>{t('dashboard')}</div>
            </Link>
          </li>
          <li className={isActive(`/${locate}/admin/user`)}>
            <Link href={`/${locate}/admin/user`} className="sidebar-link">
              <div className="icon-sidebar">
                <HiUserGroup />
              </div>
              <div>{t('user')}</div>
            </Link>
          </li>
          <li className={isActive(`/${locate}/admin/quiz`)}>
            <Link href={`/${locate}/admin/quiz`} className="sidebar-link">
              <div className="icon-sidebar">
                <FaCircleQuestion />
              </div>
              <div>{t('quizz')}</div>
            </Link>
          </li>
          <li className={isActive(`/${locate}/admin/exam`)}>
            <Link href={`/${locate}/admin/exam`} className="sidebar-link">
              <div className="icon-sidebar">
                <MdQuiz />
              </div>
              <div>{t('exam')}</div>
            </Link>
          </li>
          <li className={isActive(`/${locate}/admin/courseAdmin`)}>
            <Link href={`/${locate}/admin/courseAdmin`} className="sidebar-link">
              <div className="icon-sidebar">
                <SiCoursera />
              </div>
              <div>{t('course')}</div>
            </Link>
          </li>
          <li className={isActive(`/${locate}/admin/notify`)}>
            <Link href={`/${locate}/admin/notify`} className="sidebar-link">
              <div className="icon-sidebar">
                <FaBell />
              </div>
              <div>{t('Notify')}</div>
            </Link>
          </li>
          <li className={isActive(`/${locate}/admin/category`)}>
            <Link href={`/${locate}/admin/category`} className="sidebar-link">
              <div className="icon-sidebar">
                <BiSolidCategory />
              </div>
              <div>{t('category')}</div>
            </Link>
          </li>
          <li className={isActive(`/${locate}/admin/report`)}>
            <Link href={`/${locate}/admin/report`} className="sidebar-link">
              <div className="icon-sidebar">
                <TbMessageReportFilled />
              </div>
              <div>{t('report')}</div>
            </Link>
          </li>
          <li className={isActive(`/${locate}/admin/authority`)}>
            <Link href={`/${locate}/admin/authority`} className="sidebar-link">
              <div className="icon-sidebar">
                <SiWebauthn />
              </div>
              <div>{t('permission')}</div>
            </Link>
          </li>
          <li className={isActive(`/${locate}/admin/payment`)}>
            <Link href={`/${locate}/admin/payment`} className="sidebar-link">
              <div className="icon-sidebar">
                <FaWallet />
              </div>
              <div>{t('payment')}</div>
            </Link>
          </li>
          <li className={isActive(`/${locate}/admin/setting`)}>
            <Link href={`/${locate}/admin/setting`} className="sidebar-link">
              <div className="icon-sidebar">
                <IoSettingsSharp />
              </div>
              <div>{t('setting')}</div>
            </Link>
          </li>
          <li className={isActive(`/${locate}/admin/signout`)}>
            <Link href={`/${locate}/admin/signout`} className="sidebar-link">
              <div className="icon-sidebar">
                <FaSignOutAlt />
              </div>
              <div>{t('signout')}</div>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};
export default Sidebar;
