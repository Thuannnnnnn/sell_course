
import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Quizz",
  description: "Test your knowledge with our quizzes",
};

export default function QuizzLayout({ children }: { children: ReactNode }) {
  return (
    <>
    {children}
    </>
  );
}
