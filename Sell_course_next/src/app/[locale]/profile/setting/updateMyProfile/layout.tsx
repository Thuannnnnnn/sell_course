import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Setting My Profile',
  description: 'Setting My Profile Page',
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
