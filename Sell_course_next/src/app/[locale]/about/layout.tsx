import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'About Page',
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
