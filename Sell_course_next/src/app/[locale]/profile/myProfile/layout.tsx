import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'My Profile',
  description: 'My Profile Page',
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