"use client";

import localFont from "next/font/local";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ToastProvider } from "@/components/ui/toast";
import ChatSupportWindow from "../components/course/ChatSupportWindow";
import { useEffect, useState } from "react";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [activeVersionId, setActiveVersionId] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    const updateVersionId = () => {
      const storedVersionId = localStorage.getItem("activeVersionId");
      setActiveVersionId(storedVersionId || undefined);
    };

    window.addEventListener("activeVersionIdChanged", updateVersionId);

    // Lấy lần đầu khi mount
    updateVersionId();

    return () => {
      window.removeEventListener("activeVersionIdChanged", updateVersionId);
    };
  }, []);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased mx-auto`}
      >
        <SessionProvider refetchOnWindowFocus={false}>
          <ToastProvider>
            <div className="flex flex-col min-h-screen w-full">
              <Navbar />
              {children}
              <Footer />
              <ChatSupportWindow />
            </div>
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
