import type { Metadata } from 'next';
import { Provider } from 'react-redux';
import { store } from '../../../../../../store/store';
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
