import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Category',
  description: 'Admin Category',
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
