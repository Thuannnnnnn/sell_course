"use client";

import { useEffect, useState, useRef } from "react";
import styles from "../style/AdminSidebar.module.css";
import { MdDashboard } from "react-icons/md";
import { HiUserGroup } from "react-icons/hi2";
import { MdQuiz } from "react-icons/md";
import { SiCoursera } from "react-icons/si";
import { BiSolidCategory } from "react-icons/bi";
import { TbMessageReportFilled } from "react-icons/tb";
import { FaBell } from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";
import { FaSignOutAlt } from "react-icons/fa";
import { FaChevronDown } from "react-icons/fa";
import { BiSolidDiscount } from "react-icons/bi";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { SiWebauthn } from "react-icons/si";
import { usePathname, useRouter } from "next/navigation";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeLabel, setActiveLabel] = useState("");
  const [activeIcon, setActiveIcon] = useState<JSX.Element | null>(null);
  const t = useTranslations("dashBoard");
  const locate = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      
      if (window.innerWidth <= 768 && isOpen) {
        if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("mousedown", handleClickOutside);

    handleResize();

    // Set active menu item based on current path
    if (pathname.includes("/admin/dashboard")) {
      setActiveLabel(t("dashboard"));
      setActiveIcon(<MdDashboard />);
    } else if (pathname.includes("/admin/user")) {
      setActiveLabel(t("user"));
      setActiveIcon(<HiUserGroup />);
    } else if (pathname.includes("/admin/exam")) {
      setActiveLabel(t("exam"));
      setActiveIcon(<MdQuiz />);
    } else if (pathname.includes("/admin/courseAdmin")) {
      setActiveLabel(t("course"));
      setActiveIcon(<SiCoursera />);
    } else if (pathname.includes("/admin/notify")) {
      setActiveLabel(t("Notify"));
      setActiveIcon(<FaBell />);
    } else if (pathname.includes("/admin/category")) {
      setActiveLabel(t("category"));
      setActiveIcon(<BiSolidCategory />);
    } else if (pathname.includes("/admin/support")) {
      setActiveLabel(t("support"));
      setActiveIcon(<TbMessageReportFilled />);
    } else if (pathname.includes("/admin/promotion")) {
      setActiveLabel(t("promotion"));
      setActiveIcon(<BiSolidDiscount />);
    } else if (pathname.includes("/admin/authority")) {
      setActiveLabel(t("permission"));
      setActiveIcon(<SiWebauthn />);
    } else if (pathname.includes("/admin/setting")) {
      setActiveLabel(t("setting"));
      setActiveIcon(<IoSettingsSharp />);
    } else if (pathname.includes("/admin/signout")) {
      setActiveLabel(t("signout"));
      setActiveIcon(<FaSignOutAlt />);
    } else {
      setActiveLabel(t("dashboard"));
      setActiveIcon(<MdDashboard />);
    }

    // Toggle body overflow for mobile using direct DOM manipulation
    // This approach avoids using :global in CSS modules
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, pathname, t, isMobile]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleItemClick = (path: string, label: string, icon: JSX.Element) => {
    setActiveLabel(label);
    setActiveIcon(icon);
    setDropdownOpen(false);
    if (isMobile) {
      setIsOpen(false);
    }
    router.push(path);
  };

  const isActive = (path: string) => {
    return pathname === path ? styles.active : "";
  };

  // Menu items array to avoid repetition
  const menuItems = [
    { path: "dashboard", label: t("dashboard"), icon: <MdDashboard /> },
    { path: "user", label: t("user"), icon: <HiUserGroup /> },
    { path: "exam", label: t("exam"), icon: <MdQuiz /> },
    { path: "courseAdmin", label: t("course"), icon: <SiCoursera /> },
    { path: "notify", label: t("Notify"), icon: <FaBell /> },
    { path: "category", label: t("category"), icon: <BiSolidCategory /> },
    { path: "support", label: t("support"), icon: <TbMessageReportFilled /> },
    { path: "promotion", label: t("promotion"), icon: <BiSolidDiscount /> },
    { path: "authority", label: t("permission"), icon: <SiWebauthn /> },
    { path: "setting", label: t("setting"), icon: <IoSettingsSharp /> },
    { path: "signout", label: t("signout"), icon: <FaSignOutAlt /> }
  ];

  // Desktop sidebar
  const renderDesktopSidebar = () => (
    <div className={`${styles.sidebarContainer} ${isOpen ? styles.open : styles.closed}`} ref={sidebarRef}>
      <button className={styles.toggleBtn} onClick={toggleSidebar}>
      </button>
      <div className={styles.sidebar}>
        <ul>
          {menuItems.map((item) => (
            <li key={item.path} className={isActive(`/${locate}/admin/${item.path}`)}>
              <Link 
                href={`/${locate}/admin/${item.path}`} 
                className={styles.sidebarLink}
                onClick={() => { 
                  setActiveLabel(item.label); 
                  setActiveIcon(item.icon); 
                }}
              >
                <div className={styles.iconSidebar}>
                  {item.icon}
                </div>
                <div className={styles.linkText}>{item.label}</div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  // Mobile dropdown menu
  const renderMobileDropdown = () => (
    <div className={styles.mobileNav} ref={dropdownRef}>
      <button className={styles.mobileMenuButton} onClick={toggleDropdown}>
        <span className={styles.activeItemIcon}>{activeIcon}</span>
        <span className={styles.activeItemLabel}>{activeLabel}</span>
        <FaChevronDown className={`${styles.dropdownArrow} ${dropdownOpen ? styles.arrowOpen : ''}`} />
      </button>
      
      {dropdownOpen && (
        <div className={styles.mobileDropdown}>
          {menuItems.map((item) => (
            <div 
              key={item.path}
              className={`${styles.dropdownItem} ${pathname.includes(`/admin/${item.path}`) ? styles.active : ''}`}
              onClick={() => handleItemClick(`/${locate}/admin/${item.path}`, item.label, item.icon)}
            >
              <span className={styles.dropdownItemIcon}>{item.icon}</span>
              <span className={styles.dropdownItemLabel}>{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      {isMobile ? renderMobileDropdown() : renderDesktopSidebar()}
      {isMobile && isOpen && renderDesktopSidebar()}
    </>
  );
};

export default Sidebar;