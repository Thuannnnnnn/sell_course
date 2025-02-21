import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Exam',
  description: 'Exam Question',
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
