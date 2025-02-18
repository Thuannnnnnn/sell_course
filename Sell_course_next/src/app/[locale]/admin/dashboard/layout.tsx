import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'DashBoard',
  description: 'Admin Dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
    </>
  );
}
