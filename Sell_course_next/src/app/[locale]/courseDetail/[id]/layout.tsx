import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Course',
  description: 'Course',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}
