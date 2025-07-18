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
          <Toaster
            position="top-right"
            theme="light"
            toastOptions={{
              unstyled: false,
              style: {
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                padding: '12px 16px',
              },
              classNames: {
                toast: 'group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-950 group-[.toaster]:border-slate-200 group-[.toaster]:shadow-lg',
                success: 'group-[.toast]:bg-green-50 group-[.toast]:text-green-800 group-[.toast]:border-green-200',
                error: 'group-[.toast]:bg-red-50 group-[.toast]:text-red-800 group-[.toast]:border-red-200',
                warning: 'group-[.toast]:bg-yellow-50 group-[.toast]:text-yellow-800 group-[.toast]:border-yellow-200',
                info: 'group-[.toast]:bg-blue-50 group-[.toast]:text-blue-800 group-[.toast]:border-blue-200',
              },
            }}
          />
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
