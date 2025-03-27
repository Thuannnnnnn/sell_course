import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Setting",
  description: "Setting Page",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
