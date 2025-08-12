"use client";
import React, { createContext, useContext, ReactNode } from "react";
import { CourseResponseDTO } from "../app/types/Course/Course";

interface BannerData {
  carousel?: string;
  versionSetting?: {
    VersionSettingtitle?: string;
  };
}

interface HomeDataContextType {
  bannerData: BannerData | null;
  featuredCourses: CourseResponseDTO[];
  isLoading: boolean;
}

const HomeDataContext = createContext<HomeDataContextType | undefined>(undefined);

interface HomeDataProviderProps {
  children: ReactNode;
  bannerData: BannerData | null;
  featuredCourses: CourseResponseDTO[];
  isLoading: boolean;
}

export function HomeDataProvider({ 
  children, 
  bannerData, 
  featuredCourses, 
  isLoading 
}: HomeDataProviderProps) {
  return (
    <HomeDataContext.Provider value={{ bannerData, featuredCourses, isLoading }}>
      {children}
    </HomeDataContext.Provider>
  );
}

export function useHomeData() {
  const context = useContext(HomeDataContext);
  if (context === undefined) {
    throw new Error("useHomeData must be used within a HomeDataProvider");
  }
  return context;
}
