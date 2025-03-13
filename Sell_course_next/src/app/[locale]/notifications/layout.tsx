import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifycaitions",
  description: "Notifycaitions Page",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div>{children}</div>
    </>
  );
}
