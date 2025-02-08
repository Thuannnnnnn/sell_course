
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment fail",
  description: "Payment fail",
};

export default function CartLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {children}
    </>
  );
}
