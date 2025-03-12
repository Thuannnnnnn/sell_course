"use client";
import React, { useState } from "react";
import {
  Navbar,
  Container,
  Nav,
  Image,
  Button,
  Dropdown,
  Badge,
} from "react-bootstrap";
import { useSession, signOut } from "next-auth/react";
import "../style/header.css";
import Link from "next/link";
import LocalSwitcher from "./local-switcher";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { IoIosLogOut } from "react-icons/io";
// import { MdDarkMode } from "react-icons/md";
// import { MdLightMode } from "react-icons/md";
// import { useTheme } from "../contexts/ThemeContext";
import { FaRegBell, FaRegUser } from "react-icons/fa";
import { useTheme } from "@/contexts/ThemeContext";
import "@/style/NotificationDropdown.css";
const Header: React.FC = () => {
  const { data: session, status } = useSession();
  const localActive = useLocale();
  const t = useTranslations("Header");
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  // const toggleTheme = () => {
  //   const newTheme = theme === "dark" ? "light" : "dark";
  // };
  setTheme("light");

  const [notifications, setNotifications] = useState([
    { id: 1, message: "New message received" },
    { id: 2, message: "Your course has been updated" },
    { id: 3, message: "A new user followed you" },
  ]);
  return (
    <Navbar
      expand="lg"
      bg={theme}
      className="sticky-header"
      data-bs-theme={theme}
    >
      <Container
        fluid
        className="d-flex justify-content-between align-items-center"
      >
        <div className="d-flex align-items-center">
          <Link href={`/${localActive}`}>
            <Image
              src="/RedFlag_GoldenStar.png"
              alt="logo"
              rounded
              className="me-2"
              width={80}
            />
          </Link>
          <Navbar.Brand href={`/${localActive}`} className="title-custom">
            <span className="red-flag">RedFlag</span>{" "}
            <span className="golden-star">GoldenStar</span>
          </Navbar.Brand>
        </div>

        <Nav className="d-flex align-items-center flex-nowrap">
          {session?.user.role == "ADMIN" || session?.user.role == "STAFF" ? (
            <Link
              href={`/${localActive}/admin/dashboard`}
              className="nav-link me-4"
            >
              {t("manage")}
            </Link>
          ) : null}
          {/* <Link href={`/${localActive}/`} className="nav-link me-4">
            {t("home")}
          </Link> */}
          <Link href={`/${localActive}/showCourse`} className="nav-link me-4">
            {t("course")}
          </Link>
          <Link href={`/${localActive}/cart`} className="nav-link me-4">
            {t("cart")}
          </Link>
          <Link href={`/${localActive}/forum`} className="nav-link me-4">
            {t("forum")}
          </Link>
          {/* <Button
            onClick={toggleTheme}
            variant={`${theme}`}
            className="btn-signup mx-3"
          >
            {theme === "dark" ? (
              <MdLightMode color="white" />
            ) : (
              <MdDarkMode color="black" />
            )}
          </Button> */}
          <LocalSwitcher />
          {status === "loading" ? (
            <span className="nav-link mx-4">Loading...</span>
          ) : session ? (
            <>
              <Link
                href={`/${localActive}/profile/myProfile`}
                className="nav-link"
              >
                <FaRegUser />
              </Link>
              <Dropdown align="end" className="m-2">
                <Dropdown.Toggle
                  bsPrefix="undropdown-toggle"
                  variant="link"
                  className="bell-container nav-link p-0"
                  id="dropdown-no-caret"
                >
                  <div className="bell-wrapper">
                    <FaRegBell size={20} className="notification-bell" />
                    {notifications.length > 0 && (
                      <Badge bg="danger" pill className="notification-badge">
                        {notifications.length}
                      </Badge>
                    )}
                  </div>
                </Dropdown.Toggle>

                <Dropdown.Menu className="notification-dropdown mb-8">
                  <Dropdown.Header className="notification-header">
                    Notifications
                  </Dropdown.Header>
                  {notifications.length > 0 ? (
                    notifications.map((notify) => (
                      <Dropdown.Item
                        key={notify.id}
                        className="notification-item"
                      >
                        <span style={{ flex: 1 }}>{notify.message}</span>
                      </Dropdown.Item>
                    ))
                  ) : (
                    <Dropdown.Item disabled className="notification-empty">
                      No new notifications
                    </Dropdown.Item>
                  )}
                  <Dropdown.Divider />
                  <Dropdown.Item eventKey="4">Separated link</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <Button
                variant={`${theme}`}
                onClick={() => signOut()}
                className="btn btn-link nav-link mx-4"
              >
                <IoIosLogOut />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant={`${theme}`}
                onClick={() => {
                  router.push(`/${localActive}/auth/signUp`);
                }}
                className={`btn-signup mx-3 ${theme}`}
              >
                {t("signup")}
              </Button>
              <Button
                variant="light"
                onClick={() => {
                  router.push(`/${localActive}/auth/login`);
                }}
                className="btn-login"
              >
                {t("login")}
              </Button>
            </>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
};

export default Header;
