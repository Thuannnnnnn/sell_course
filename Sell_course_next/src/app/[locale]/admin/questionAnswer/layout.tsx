import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Question Answer',
  description: 'Question Answer Page',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}
