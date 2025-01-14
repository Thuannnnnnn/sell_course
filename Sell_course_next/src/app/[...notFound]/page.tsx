// NotFound.tsx
'use client';
import Link from "next/link";
import ErrorIcon from "@material-ui/icons/Error";
import { Typography } from "@material-ui/core";
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="pageNotFound">
      <div className="content">
        <ErrorIcon className="icon" />
        <Typography variant="h2" component="h1" className="title">
          Oops! Page Not Found
        </Typography>
        <Typography variant="body1" className="description">
          The page you are looking for doesn’t exist or has been moved.
        </Typography>
        <Link href="/" className="homeLink">
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
