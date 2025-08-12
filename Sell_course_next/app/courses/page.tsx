"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, Filter, Grid, List, X } from "lucide-react";
import { CourseResponseDTO } from "../types/Course/Course";
import { courseApi } from "../api/courses/courses";
import CourseCard from "../../components/course/CourseCard";
import CourseListItem from "../../components/course/CourseListItem";
import FilterSidebar from "../../components/course/FilterSidebar";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "../../components/ui/sheet";

interface FilterState {
  categories: string[];
  skills: string[];
  priceRange: {
    min: number;
    max: number;
  };
  durationRange: {
    min: number;
    max: number;
  };
}

type SortBy = "newest" | "oldest" | "price-low" | "price-high" | "duration";
type ViewMode = "grid" | "list";

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage] = useState(6);
  
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    skills: [],
    priceRange: { min: 0, max: 10000000 },
    durationRange: { min: 0, max: 1000 },
  });

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await courseApi.getAllCourses();
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Update filter ranges when courses are loaded
  useEffect(() => {
    if (courses.length > 0) {
      const prices = courses.map(course => course.price);
      const durations = courses.map(course => course.duration);
      
      setFilters(prev => ({
        ...prev,
        priceRange: {
          min: Math.min(...prices),
          max: Math.max(...prices)
        },
        durationRange: {
          min: Math.min(...durations),
          max: Math.max(...durations)
        }
      }));
    }
  }, [courses]);

  // Filter and search courses
  const filteredCourses = useMemo(() => {
    const filtered = courses.filter((course) => {
      // Search filter
      const matchesSearch = course.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructorName.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter
      const matchesCategory = filters.categories.length === 0 || 
        filters.categories.includes(course.categoryId);

      // Skill filter
      const matchesSkill = filters.skills.length === 0 || 
        filters.skills.includes(course.skill);

      // Price range filter
      const matchesPrice = course.price >= filters.priceRange.min && 
        course.price <= filters.priceRange.max;

      // Duration range filter
      const matchesDuration = course.duration >= filters.durationRange.min && 
        course.duration <= filters.durationRange.max;

      return matchesSearch && matchesCategory && 
             matchesSkill && matchesPrice && matchesDuration;
    });

    // Sort courses
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "duration":
        filtered.sort((a, b) => a.duration - b.duration);
        break;
      default:
        break;
    }

    return filtered;
  }, [courses, searchTerm, filters, sortBy]);

  // Pagination
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      categories: [],
      skills: [],
      priceRange: { min: 0, max: 10000000 },
      durationRange: { min: 0, max: 1000 },
    });
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Get active filter count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.skills.length > 0) count++;
    if (filters.priceRange.min > 0 || filters.priceRange.max < 10000000) count++;
    if (filters.durationRange.min > 0 || filters.durationRange.max < 1000) count++;
    return count;
  }, [filters]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
              <div className="bg-gray-200 h-4 rounded mb-2"></div>
              <div className="bg-gray-200 h-4 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Courses ({filteredCourses.length})
          </h1>
          
          {/* Search and Filters Bar */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full"
              />
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="duration">Duration</SelectItem>
              </SelectContent>
            </Select>

            {/* Mobile Filter */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="ml-2 bg-blue-500 text-white rounded-full px-2 py-1 text-xs">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <FilterSidebar 
                  filters={filters} 
                  setFilters={setFilters}
                  courses={courses}
                />
              </SheetContent>
            </Sheet>

            {/* View Mode */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="flex-1"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="flex-1"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Active filters:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-3 w-3 mr-1" />
                Clear all
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <FilterSidebar 
              filters={filters} 
              setFilters={setFilters}
              courses={courses}
            />
          </div>

          {/* Courses Grid/List */}
          <div className="flex-1">
            {currentCourses.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No courses found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search terms or filters
                </p>
              </div>
            ) : (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {currentCourses.map((course) => (
                      <CourseCard key={course.courseId} course={course} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentCourses.map((course) => (
                      <CourseListItem key={course.courseId} course={course} />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      
                      {[...Array(Math.min(5, totalPages))].map((_, index) => {
                        const page = currentPage <= 3 
                          ? index + 1 
                          : currentPage + index - 2;
                        
                        if (page > totalPages) return null;
                        
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        );
                      })}
                      
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
