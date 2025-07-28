"use client";
import React from "react";
import { ProfileInfo } from "@/components/sections/ProfileInfo";
import { WishlistSection } from "@/components/sections/WishlistSection";
import { CertificateSection } from "@/components/sections/CertificateSection";
import { AuthGuard } from "@/components/AuthGuard";
export default function ProfilePage() {
  return (
    <AuthGuard fallback={<div>Checking access...</div>}>
      <div className="min-h-screen w-full bg-background">
        <div className="w-full px-4 md:px-48 py-12">
          <div className="grid gap-8">
            <ProfileInfo />
            <WishlistSection />
            <CertificateSection />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
