import React from "react";

export const metadata = {
  title: "My App",
  description: "This is the main layout of my app",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
