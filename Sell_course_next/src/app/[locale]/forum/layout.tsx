import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forum",
  description: "Forum",
};

export default function ForumLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
