'use client';
import React from 'react';
import { Navbar, Container, Nav, Image, Button, Form } from 'react-bootstrap';
import { useSession, signOut } from 'next-auth/react';
import '../style/Header.css';
import Link from 'next/link';
import LocalSwitcher from './local-switcher';
import { useLocale, useTranslations } from 'next-intl';

const Header: React.FC = () => {
  const { data: session, status } = useSession();
  const localActive = useLocale();
  const t = useTranslations('Header');
  return (
    <Navbar bg="light" expand="lg" className="sticky-header">
      <Container fluid className="d-flex justify-content-between align-items-center">
  <div className="d-flex align-items-center">
  <Link href={`/${localActive}`} >
  <Image src="/logo.png" alt="logo" rounded className="me-4" width={38} />
  </Link>
    <Navbar.Brand href={`/${localActive}`} className="title-custom">{t("title")}</Navbar.Brand>
  </div>
  
  <Navbar.Toggle aria-controls="basic-navbar-nav" />
  <Navbar.Collapse id="basic-navbar-nav">
    <Nav className="me-auto d-flex align-items-center">
      <Form className="d-flex">
        <Form.Control
          type="search"
          placeholder="Search"
          className="me-2"
          aria-label="Search"
        />
        <Button variant="outline-success">{t("search")}</Button>
      </Form>
    </Nav>
    <Nav>
      <LocalSwitcher/>
    </Nav>
    <Nav className="d-flex align-items-center">
  {status === 'loading' ? (
    <span className="nav-link mx-4">Loading...</span>
  ) : session ? (
    <>
      <Link href="/profile" className="nav-link">{session.user?.name}
      </Link>
      <Button onClick={() => signOut()} className="btn btn-link nav-link mx-4">
      {t("logout")}
      </Button>
    </>
  ) : (
    <Link href={`/${localActive}/auth/login`}  className="nav-link mx-4">
      {t("login")}
    </Link>
  )}
</Nav>
  </Navbar.Collapse>
</Container>
    </Navbar>
  );
};

export default Header;
