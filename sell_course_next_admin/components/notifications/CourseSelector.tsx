'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';

import { Search, BookOpen, X, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { ScrollArea } from '../ui/scroll-area';

interface CourseData {
  courseId: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  rating: number;
  level: string;
  status: string;
  instructorId: string;
  instructorName: string;
  instructorAvatar?: string;
  categoryId: string;
  categoryName: string;
}

interface CourseSelectorProps {
  selectedCourses: string[];
  onCoursesChange: (courseIds: string[]) => void;
  className?: string;
}

interface SearchResponse {
  courses: CourseData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const CourseSelector: React.FC<CourseSelectorProps> = ({
  selectedCourses,
  onCoursesChange,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [allCourses, setAllCourses] = useState<CourseData[]>([]); // Store all courses
  const [filteredCourses, setFilteredCourses] = useState<CourseData[]>([]); // Store filtered results
  const [selectedCourseDetails, setSelectedCourseDetails] = useState<CourseData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [total, setTotal] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set()); // Track failed images
  const hasFetchedRef = useRef(false); // Track if we've already fetched

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Fetch ALL courses once
  const fetchAllCourses = useCallback(async () => {
    console.log('🔍 Fetching ALL courses...');
    
    // Prevent multiple simultaneous requests and duplicate fetches
    if (isLoading || hasFetchedRef.current) return;
    
    hasFetchedRef.current = true; // Mark as fetched
    setIsLoading(true);
    try {
      const url = `${API_BASE_URL}/api/admin/courses/search?query=&page=1&limit=0`; // limit=0 means no limit
      console.log('📡 API URL:', url);
      
      const response = await fetch(url);
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SearchResponse = await response.json();
      console.log('📡 API Response - Total courses:', data.total);
      
      setAllCourses(data.courses);
      setFilteredCourses(data.courses); // Initially show all courses
      setTotal(data.total);
    } catch (error) {
      console.error('❌ Error fetching courses:', error);
      setAllCourses([]);
      setFilteredCourses([]);
      hasFetchedRef.current = false; // Reset on error to allow retry
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL, isLoading]);

  // Fetch course details for selected courses
  const fetchSelectedCourseDetails = useCallback(async () => {
    if (selectedCourses.length === 0) {
      setSelectedCourseDetails([]);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/courses/getAll`);
      if (!response.ok) {
        throw new Error('Failed to fetch course details');
      }

      const allCourses: CourseData[] = await response.json();
      const selectedDetails = allCourses.filter(course => selectedCourses.includes(course.courseId));
      setSelectedCourseDetails(selectedDetails);
    } catch (error) {
      console.error('Error fetching course details:', error);
    }
  }, [selectedCourses, API_BASE_URL]);

  // Load ALL courses when component mounts or dropdown opens
  useEffect(() => {
    if (isOpen && !hasFetchedRef.current && !isLoading) {
      fetchAllCourses(); // Load ALL courses once
    }
  }, [isOpen, fetchAllCourses, isLoading]);

  // Client-side filtering effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCourses(allCourses); // Show all courses when no search
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    const delayedSearch = setTimeout(() => {
      const filtered = allCourses.filter(course => 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructorName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCourses(filtered);
      setIsSearching(false);
    }, 300); // Reduced since it's client-side filtering

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, allCourses]);

  // Fetch selected course details when selectedCourses changes
  useEffect(() => {
    fetchSelectedCourseDetails();
  }, [fetchSelectedCourseDetails]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      hasFetchedRef.current = false; // Reset fetch flag on unmount
      setImageErrors(new Set()); // Clear image errors on unmount
    };
  }, []);

  // Handle course selection
  const handleCourseSelect = useCallback((courseId: string) => {
    const newSelectedCourses = selectedCourses.includes(courseId)
      ? selectedCourses.filter(id => id !== courseId)
      : [...selectedCourses, courseId];
    
    onCoursesChange(newSelectedCourses);
  }, [selectedCourses, onCoursesChange]);

  // Handle remove course
  const handleRemoveCourse = (courseId: string) => {
    onCoursesChange(selectedCourses.filter(id => id !== courseId));
  };

  // No need for load more since we load all courses at once

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Selected Courses Display */}
      {selectedCourseDetails.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Selected Courses ({selectedCourseDetails.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {selectedCourseDetails.map((course) => (
              <Badge
                key={course.courseId}
                variant="secondary"
                className="flex items-center gap-2 px-3 py-1 max-w-xs"
              >
                <BookOpen className="h-4 w-4" />
                <span className="text-sm truncate">{course.title}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={(e) => {
                    e.preventDefault(); // Prevent form submission
                    handleRemoveCourse(course.courseId);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Search Courses
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          {isSearching && (
            <div className="absolute right-12 top-3 h-4 w-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}
          <Input
            placeholder="Search by course title, description, or instructor..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 pr-20"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1"
            onClick={(e) => {
              e.preventDefault(); // Prevent form submission
              const newIsOpen = !isOpen;
              setIsOpen(newIsOpen);
              
              // Reset search when closing
              if (!newIsOpen) {
                setSearchQuery('');
                setFilteredCourses(allCourses); // Reset to show all courses
              }
            }}
          >
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Search Results */}
      {isOpen && (
        <Card className="border-2 border-gray-200">
          <CardContent className="p-0">
            <ScrollArea className="h-64">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2">Loading all courses...</p>
                </div>
              ) : filteredCourses.length > 0 ? (
                <div className="space-y-1 p-2">
                  {filteredCourses.map((course) => (
                    <div
                      key={course.courseId}
                      className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedCourses.includes(course.courseId)
                          ? 'bg-blue-50 border-blue-200 border'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                      onClick={(e) => {
                        // Only handle click if not clicking on checkbox
                        if (e.target !== e.currentTarget.querySelector('input[type="checkbox"]')) {
                          handleCourseSelect(course.courseId);
                        }
                      }}
                    >
                      <div onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedCourses.includes(course.courseId)}
                          onCheckedChange={() => handleCourseSelect(course.courseId)}
                        />
                      </div>
                      
                      {/* Course Thumbnail */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                          {course.thumbnail && 
                           course.thumbnail.trim() && 
                           course.thumbnail !== 'null' &&
                           course.thumbnail !== 'undefined' &&
                           !course.thumbnail.includes('placeholder') && 
                           !imageErrors.has(course.courseId) &&
                           (course.thumbnail.startsWith('http') || course.thumbnail.startsWith('/')) ? (
                            <Image
                              src={course.thumbnail}
                              alt={course.title}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover rounded"
                              loading="lazy"
                              onError={() => {
                                console.log('❌ Image failed to load:', course.thumbnail);
                                // Add to error set to prevent retry
                                setImageErrors(prev => new Set(prev).add(course.courseId));
                              }}
                            />
                          ) : (
                            <BookOpen className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                      </div>
                      
                      {/* Course Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {course.title}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 ml-2">
                            <Badge variant="outline" className="text-xs">
                              {course.level}
                            </Badge>
                            <Badge 
                              variant={course.status === 'PUBLISHED' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {course.status}
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Course Meta */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-green-600">
                              {formatPrice(course.price)}
                            </span>
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-gray-500">
                                {course.rating}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">
                              By {course.instructorName}
                            </p>
                            <p className="text-xs text-gray-400">
                              {course.categoryName}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No courses found</p>
                  <p className="text-sm">
                    {searchQuery ? 'Try adjusting your search query' : 'No courses available'}
                  </p>
                  <p className="text-xs mt-1">
                    Total courses in system: {total}
                  </p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CourseSelector;