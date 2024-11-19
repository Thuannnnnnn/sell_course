'use client';
import React from 'react';
import { Navbar, Container, Nav, Image, Button, Form } from 'react-bootstrap';
import { useSession, signOut } from 'next-auth/react';
import '../style/Header.css';
import Link from 'next/link';
import LocalSwitcher from './local-switcher';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { IoIosSearch } from "react-icons/io";
import { useTheme } from '../context/ThemeContext';
import { MdDarkMode } from "react-icons/md";
import { MdLightMode } from "react-icons/md";
const Header: React.FC = () => {
  const { data: session, status } = useSession();
  const localActive = useLocale();
  const t = useTranslations('Header');
  const router = useRouter()
  const { theme, setTheme } = useTheme();
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };
  return (
<Navbar expand="lg" bg={theme} className="sticky-header" data-bs-theme={theme}>
  <Container fluid className="d-flex justify-content-between align-items-center">
    <div className="d-flex align-items-center">
      <Link href={`/${localActive}`}>
        <Image src="/logo.png" alt="logo" rounded className="me-4" width={38} />
      </Link>
      <Navbar.Brand href={`/${localActive}`} className="title-custom">{t("title")}</Navbar.Brand>
    </div>

    <div className="search-container">
  <Form className="search-form d-flex mx-auto w-100 position-relative">
    <IoIosSearch className="search-icon" />
    <Form.Control
      type="search"
      placeholder={t("search")}
      className="me-2 search-form-input"
      aria-label="Search"
    />
  </Form>
</div>
      <Nav className="d-flex align-items-center">
      <Button onClick={toggleTheme} variant={`${theme}`} className="btn-signup mx-3">
        {theme === 'dark' ? <MdLightMode color="white"/> : <MdDarkMode color="black"/>}
      </Button>
        <LocalSwitcher />
        {status === 'loading' ? (
          <span className="nav-link mx-4">Loading...</span>
        ) : session ? (
          <>
            <Link href="/profile" className="nav-link">{session.user?.name}</Link>
            <Button onClick={() => signOut()} className="btn btn-link nav-link mx-4">
              {t("logout")}
            </Button>
          </>
        ) : (
          <>
          <Button variant={`${theme}`} className={`btn-signup mx-3 ${theme}`}>
            {t("signup")}
          </Button>
          <Button variant="light" onClick={() => { router.push(`/${localActive}/auth/login`) }} className="btn-login">
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
