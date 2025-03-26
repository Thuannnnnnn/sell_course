import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support",
  description: "Support Page",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
