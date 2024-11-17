import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import 'bootstrap/dist/css/bootstrap.min.css';
import { SessionProvider } from 'next-auth/react';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Home Page',
  description: 'Home Page of sell course',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <SessionProvider>
          <Header />
          <div className="container">
          <main className="content">{children}</main>
        </div>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
