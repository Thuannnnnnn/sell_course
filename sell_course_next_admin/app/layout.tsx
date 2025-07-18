"use client";
import localFont from "next/font/local";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Sidebar } from "../components/dashboard/Sidebar";
import { Header } from "../components/dashboard/Header";
import React, { useState } from "react";
import { Toaster } from "sonner";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeVersionId, setActiveVersionId] = useState<string | undefined>(undefined);
  const pathname = usePathname();
  
  // Check if current page is auth page
  const isAuthPage = pathname?.startsWith('/auth');

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

  // Debug
  console.log("activeVersionId:", activeVersionId);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider refetchOnWindowFocus={false}>
          <Toaster position="top-right" />
          
          {isAuthPage ? (
            // Auth pages - full page without sidebar and header
            <div className="min-h-screen">
              {children}
            </div>
          ) : (
            // Regular pages - with sidebar and header
            <div className="flex h-screen bg-background">
              {/* Sidebar */}
              <Sidebar
                open={sidebarOpen}
                setOpen={setSidebarOpen}
                versionId={activeVersionId}
              />

              {/* Main Content */}
              <div className="flex-1 flex flex-col md:ml-64">
                {/* Header */}
                <Header onMenuClick={() => setSidebarOpen(true)} />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                  {children}
                </main>
              </div>
            </div>
          )}
        </SessionProvider>
      </body>
    </html>
  );
}
