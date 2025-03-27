import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Verify Certificate Course",
  description: "Verify Certificate Page",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
