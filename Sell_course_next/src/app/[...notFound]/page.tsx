// NotFound.tsx
'use client';
import Link from 'next/link';
import { MdError } from 'react-icons/md';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="pageNotFound">
      <div className="content">
        <MdError className="icon" />
        <h1 className="title">
          Oops! Page Not Found
        </h1>
        <h3 className="description">
          The page you are looking for doesn’t exist or has been moved.
        </h3>
        <Link href="/" className="homeLink">
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
