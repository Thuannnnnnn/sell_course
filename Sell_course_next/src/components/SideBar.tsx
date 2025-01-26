"use client";
import { useEffect, useState } from "react";
import "../style/AdminSideBar.css";
import { MdDashboard } from "react-icons/md";
import { HiUserGroup } from "react-icons/hi2";
import { FaCircleQuestion } from "react-icons/fa6";
import { SiCoursera } from "react-icons/si";
import { BiSolidCategory } from "react-icons/bi";
import { TbMessageReportFilled } from "react-icons/tb";
import { FaWallet } from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";
import { FaSignOutAlt } from "react-icons/fa";
import { useTranslations } from "next-intl";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const t = useTranslations("dashBoard")

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

    window.addEventListener("resize", handleResize);

    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={`sidebar-container ${isOpen ? "open" : "closed"}`}>
      <button className="toggle-btn" onClick={toggleSidebar}>
        {isOpen ? "☰" : "→"}
      </button>
      <div className="sidebar">
        <ul>
          <li className="active">
            <div className="icon-sidebar">
              <MdDashboard />
            </div>
            <div>{t('dashboard')}</div>
          </li>
          <li>
            <div className="icon-sidebar">
              <HiUserGroup />
            </div>
            <div>{t('user')}</div>
          </li>
          <li>
            <div className="icon-sidebar">
              <FaCircleQuestion />
            </div>
            <div>{t('quizz')}</div>
          </li>
          <li>
            <div className="icon-sidebar">
              <SiCoursera />
            </div>
            <div>{t('course')}</div>
          </li>
          <li>
            <div className="icon-sidebar">
              <BiSolidCategory />
            </div>
            <div>{t('category')}</div>
          </li>
          <li>
            <div className="icon-sidebar">
              <TbMessageReportFilled />
            </div>
            <div>{t('report')}</div>
          </li>
          <li>
            <div className="icon-sidebar">
              <FaWallet />
            </div>
            <div>{t('payment')}</div>
          </li>
          <li >
            <div className="icon-sidebar">
              <IoSettingsSharp />
            </div>
            <div>{t('setting')}</div>
          </li>
          <li>
            <div className="icon-sidebar">
              <FaSignOutAlt />
            </div>
            <div>{t('signout')}</div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
