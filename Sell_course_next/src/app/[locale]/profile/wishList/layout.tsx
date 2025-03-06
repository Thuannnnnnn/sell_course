import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'WishList',
  description: 'WishList Page',
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