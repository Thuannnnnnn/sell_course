import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Authority',
  description: 'Admin Authority',
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
