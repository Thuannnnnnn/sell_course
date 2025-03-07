// components/Cart/CartLayout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Payment success',
  description: 'Payment success',
};

export default function CartLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {children}
    </>
  );
}
