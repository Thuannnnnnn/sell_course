import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Order History',
  description: 'OrderHistory Page',
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
