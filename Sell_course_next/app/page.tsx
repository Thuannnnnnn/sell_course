"use client";
import React from "react";
import { HeroSection } from "../components/sections/HeroSection";
import { FeaturedCoursesSection } from "../components/sections/FeaturedCoursesSection";
import { FeaturesSection } from "../components/sections/FeaturesSection";
import { TestimonialsSection } from "../components/sections/TestimonialsSection";
import { BlogSection } from "../components/sections/BlogSection";
import PageHead from "../components/layout/Head";
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <PageHead title="Home" description="Home" />
      <main className="flex-1 mx-auto w-full">
        <div className="flex flex-col min-h-screen w-full">
          <HeroSection />
          <FeaturedCoursesSection />
          <FeaturesSection />
          <TestimonialsSection />
          <BlogSection />
        </div>
      </main>
    </div>
  );
}
