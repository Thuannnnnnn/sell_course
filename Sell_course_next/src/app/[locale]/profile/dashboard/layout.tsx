import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Dash Board',
  description: 'DashBoard Page',
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
