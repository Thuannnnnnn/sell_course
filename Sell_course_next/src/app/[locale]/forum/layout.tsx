import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Check out',
  description: 'check out',
};

export default function ForumLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {children}
    </>
  );
}
