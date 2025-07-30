"use client";
import React from "react";
import { HeroSection } from "../components/sections/HeroSection";
import { FeaturedCoursesSection } from "../components/sections/FeaturedCoursesSection";
import { FeaturesSection } from "../components/sections/FeaturesSection";
import PageHead from "../components/layout/Head";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <PageHead title="Home" description="Home" />
      <main className="flex-1 mx-auto w-full">
        <div className="flex flex-col min-h-screen w-full animate-fade-in">
          <div className="animate-slide-up">
            <HeroSection />
          </div>
          <div className="animate-slide-up animation-delay-200">
            <FeaturedCoursesSection />
          </div>
          <div className="animate-slide-up animation-delay-400">
            <FeaturesSection />
          </div>
        </div>
      </main>
    </div>
  );
}
