'use client';
import React from 'react';
import { Navbar, Container } from 'react-bootstrap';
import '../style/Header.css';
import Link from 'next/link'
const Header: React.FC = () => {
  return (
    <Navbar bg="light" expand="lg" className="sticky-header">
      <Container>
        <Navbar.Brand href="/">My App</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <div className="me-auto d-flex">
            <Link href="/" className="nav-link m-4">
              Home
            </Link>
            <Link href="/about" className="nav-link m-4">
              About
            </Link>
            <Link href="/contact" className="nav-link m-4">
              Contact
            </Link>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
