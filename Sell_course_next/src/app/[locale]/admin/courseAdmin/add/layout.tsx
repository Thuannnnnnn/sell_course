import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Courses',
  description: 'Admin Courses',
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
