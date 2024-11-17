'use client';
import React from 'react';
import { Navbar, Container, Nav, Image, Button, Form } from 'react-bootstrap';
import { useSession, signOut } from 'next-auth/react';
import '../style/Header.css';
import Link from 'next/link';

const Header: React.FC = () => {
  const { data: session, status } = useSession();

  return (
    <Navbar bg="light" expand="lg" className="sticky-header">
      <Container fluid className="d-flex justify-content-between align-items-center">
  <div className="d-flex align-items-center">
    <Image src="/logo.png" alt="logo" rounded className="me-4" width={38} />
    <Navbar.Brand href="/" className="title-custom">Học Lập Trình Để Đi Làm</Navbar.Brand>
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
        <Button variant="outline-success">Search</Button>
      </Form>
    </Nav>
    <Nav>
      {status === 'loading' ? (
        <span className="nav-link mx-4">Loading...</span>
      ) : session ? (
        <>
          <Link href="/profile" className="nav-link m-4">Welcome, {session.user?.name}</Link>
          <button onClick={() => signOut()} className="btn btn-link nav-link mx-4">
            Sign Out
          </button>
        </>
      ) : (
        <Link href="/auth/login" className="nav-link mx-4">
          Sign In
        </Link>
      )}
    </Nav>
  </Navbar.Collapse>
</Container>

    </Navbar>
  );
};

export default Header;
