"use client";
import React from "react";
import { Navbar, Container, Nav, Image, Button } from "react-bootstrap";
import { useSession, signOut } from "next-auth/react";
import "../style/Header.css";
import Link from "next/link";
import LocalSwitcher from "./local-switcher";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { IoIosLogOut } from "react-icons/io";
import { MdDarkMode } from "react-icons/md";
import { MdLightMode } from "react-icons/md";
import { useTheme } from "../context/ThemeContext";

const Header: React.FC = () => {
  const { data: session, status } = useSession();
  const localActive = useLocale();
  const t = useTranslations("Header");
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };
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
          <Link href={`/${localActive}/home`} className="nav-link me-4">
            {t("home")}
          </Link>
          <Link href={`/${localActive}/course`} className="nav-link me-4">
            {t("course")}
          </Link>
          <Link href={`/${localActive}/cart`} className="nav-link me-4">
            {t("cart")}
          </Link>
          <Link href={`/${localActive}/news`} className="nav-link me-4">
            {t("forum")}
          </Link>
          <Button
            onClick={toggleTheme}
            variant={`${theme}`}
            className="btn-signup mx-3"
          >
            {theme === "dark" ? (
              <MdLightMode color="white" />
            ) : (
              <MdDarkMode color="black" />
            )}
          </Button>
          <LocalSwitcher />
          {status === "loading" ? (
            <span className="nav-link mx-4">Loading...</span>
          ) : session ? (
            <>
              <Link href={`/${localActive}/profile`} className="nav-link">
                <Image
                  src={`${session.user?.image}`}
                  alt="avatar"
                  className="border rounded-circle"
                  width="50"
                />
              </Link>
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
