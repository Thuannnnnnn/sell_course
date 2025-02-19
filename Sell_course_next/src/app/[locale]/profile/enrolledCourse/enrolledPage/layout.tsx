import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Enrolled Course',
  description: 'Enrolled Course Page',
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
