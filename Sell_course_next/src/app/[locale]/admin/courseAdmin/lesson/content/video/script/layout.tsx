import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Script',
  description: 'Edit video scripts for lessons',
};

export default function ScriptLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <h1>Edit Script</h1>
      {children}
    </div>
  );
}
