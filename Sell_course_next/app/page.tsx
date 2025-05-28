import React from "react";
import { Navbar } from "../components/layout/Navbar";
import { HeroSection } from "../components/sections/HeroSection";
import { FeaturedCoursesSection } from "../components/sections/FeaturedCoursesSection";
import { FeaturesSection } from "../components/sections/FeaturesSection";
import { TestimonialsSection } from "../components/sections/TestimonialsSection";
import { BlogSection } from "../components/sections/BlogSection";
import { Footer } from "../components/layout/Footer";
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Navbar />
      <main className="flex-1 mx-auto w-full">
        <div className="flex flex-col min-h-screen w-full">
          <HeroSection />
          <FeaturedCoursesSection />
          <FeaturesSection />
          <TestimonialsSection />
          <BlogSection />
        </div>
      </main>
      <Footer />
    </div>
  );
}
