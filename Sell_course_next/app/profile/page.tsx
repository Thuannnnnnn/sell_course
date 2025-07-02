"use client";
import React from "react";
import { ProfileInfo } from "@/components/sections/ProfileInfo";
// import { WishlistSection } from "@/components/sections/WishlistSection";
export default function ProfilePage() {
  return (
    <div className="min-h-screen w-full bg-background">
      <div className="w-full px-4 md:px-48 py-12">
        <div className="grid gap-8">
          <ProfileInfo />
          {/* <WishlistSection /> */}
        </div>
      </div>
    </div>
  );
}
