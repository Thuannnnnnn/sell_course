import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import 'bootstrap/dist/css/bootstrap.min.css';
import { SessionProvider } from 'next-auth/react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

const geistSans = localFont({
  src: '../fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: '../fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Home Page',
  description: 'Home Page of sell course',
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(params.locale as "en" | "vn")) {
    notFound();
  }
  

  // Get messages dynamically based on locale
  const messages = await getMessages({ locale: params.locale });

  return (
    <html lang={params.locale}>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <SessionProvider>
          <NextIntlClientProvider messages={messages}>
            <Header />
            <div className="container">
              <main className="content">{children}</main>
            </div>
            <Footer />
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}