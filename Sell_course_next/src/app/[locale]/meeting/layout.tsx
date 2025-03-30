import React from "react";
import { Metadata } from "next";
import "@/style/Meeting.css";

export const metadata: Metadata = {
  title: "Video Meetings",
  description: "Join or create video meetings for online learning",
};

export default function MeetingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <main>{children}</main>
    </div>
  );
}
