import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Course Info",
  description: "Course Info",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children} </>;
}
