"use client";
import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { HeroSection } from "../components/sections/HeroSection";
import { FeaturedCoursesSection } from "../components/sections/FeaturedCoursesSection";
import { FeaturesSection } from "../components/sections/FeaturesSection";
import PageHead from "../components/layout/Head";
import { HomeDataProvider } from "../contexts/HomeDataContext";
import { courseApi } from "./api/courses/courses";
import { settingsApi } from "../lib/api/settingsApi";
import { CourseResponseDTO } from "./types/Course/Course";

interface BannerData {
  carousel?: string;
  versionSetting?: {
    VersionSettingtitle?: string;
  };
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [bannerData, setBannerData] = useState<BannerData | null>(null);
  const [featuredCourses, setFeaturedCourses] = useState<CourseResponseDTO[]>([]);

  useEffect(() => {
    const loadPageData = async () => {
      try {
        setIsLoading(true);
        setLoadingProgress(0);

        // Load banner data
        setLoadingProgress(25);
        const bannerPromise = settingsApi.getActiveVersion().then(async (version) => {
          if (version?.versionSettingId) {
            const banner = await settingsApi.getBannerByVersionId(version.versionSettingId);
            setBannerData(banner);
            return banner;
          }
          return null;
        });

        setLoadingProgress(50);
        
        // Load featured courses data
        const coursesPromise = courseApi.getAllCourses().then(courses => {
          const featured = courses.filter(course => course.status === 'PUBLISHED').slice(0, 4);
          setFeaturedCourses(featured);
          return featured;
        });

        setLoadingProgress(75);

        // Wait for all data to load
        await Promise.all([bannerPromise, coursesPromise]);

        setLoadingProgress(100);
        
        // Add a small delay to ensure smooth transition
        setTimeout(() => {
          setIsLoading(false);
        }, 500);

      } catch (error) {
        console.error("Error loading page data:", error);
        // Even if there's an error, show the page after timeout
        setTimeout(() => {
          setIsLoading(false);
        }, 2000);
      }
    };

    loadPageData();
  }, []);

  // Loading screen
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center space-y-6">
          {/* Logo or Brand */}
          
          {/* Loading Animation */}
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
            <div className="absolute inset-0 h-12 w-12 border-4 border-blue-200 rounded-full mx-auto animate-pulse"></div>
          </div>
          
          {/* Loading Text */}
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Preparing your learning experience...</div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-80 bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out relative"
              style={{ width: `${loadingProgress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
          
          {/* Progress Text */}
          <div className="text-sm font-medium text-gray-700">
            {loadingProgress}% Complete
          </div>
          
          {/* Loading Status */}
          <div className="text-xs text-gray-500">
            {loadingProgress < 25 && "Initializing..."}
            {loadingProgress >= 25 && loadingProgress < 50 && "Loading banner content..."}
            {loadingProgress >= 50 && loadingProgress < 75 && "Fetching courses..."}
            {loadingProgress >= 75 && loadingProgress < 100 && "Finalizing..."}
            {loadingProgress === 100 && "Ready!"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <HomeDataProvider
      bannerData={bannerData}
      featuredCourses={featuredCourses}
      isLoading={false}
    >
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
    </HomeDataProvider>
  );
}
