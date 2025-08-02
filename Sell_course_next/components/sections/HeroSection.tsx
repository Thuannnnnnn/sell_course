"use client";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { AspectRatio } from "../ui/aspect-ratio";
import Image from "next/image";
import { settingsApi } from "../../lib/api/settingsApi";
import Link from "next/link";

export function HeroSection() {
  const [bannerUrl, setBannerUrl] = useState<string | undefined>(undefined);
  const [bannerTitle, setBannerTitle] = useState<string>("Learn Programming with Experts");
  useEffect(() => {
    async function fetchBanner() {
      try {
        // 1. Lấy version active
        const version = await settingsApi.getActiveVersion();
        if (!version?.versionSettingId) return;
        // 2. Lấy banner theo versionId
        const banner = await settingsApi.getBannerByVersionId(version.versionSettingId);
        // banner là object, không phải mảng!
        setBannerUrl(banner?.carousel);
        setBannerTitle(banner?.versionSetting?.VersionSettingtitle || "Learn Programming with Experts");
      } catch {
        setBannerUrl(undefined);
      }
    }
    fetchBanner();
  }, []);

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background flex items-center justify-center">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="flex flex-col justify-center space-y-4 animate-slide-up">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                {bannerTitle}
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Access hundreds of quality courses, from basic to advanced.
                Start your journey today.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/courses">
                <Button size="lg" className="px-8 transform transition-all duration-300 hover:scale-105 active:scale-95">
                  Browse Courses
                </Button>
              </Link>
            </div>
          </div>
          <div className="mx-auto lg:mx-0 w-full max-w-[500px] animate-slide-up animation-delay-200">
            <AspectRatio
              ratio={16 / 9}
              className="bg-muted overflow-hidden rounded-xl transform transition-all duration-500 hover:scale-105 hover:shadow-xl"
            >
              <Image
                src={
                  bannerUrl ||
                  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"
                }
                alt="Banner"
                className="object-cover w-full h-full transition-transform duration-700 hover:scale-110"
                width={600}
                height={280}
              />
            </AspectRatio>
          </div>
        </div>
      </div>
    </section>
  );
}
