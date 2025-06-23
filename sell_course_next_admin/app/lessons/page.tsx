"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchLessons, deleteLesson } from "../api/lessons/lesson";
import { Lesson } from "../types/lesson";
import { Course } from "../types/course";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Edit, Trash2, Plus, BookOpen, FileText, Search, ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";

interface LessonWithCourse extends Lesson {
  course?: Course | null;
}

export default function LessonManagementPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [lessons, setLessons] = useState<LessonWithCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      if (!session?.accessToken) {
        setError("You are not logged in or lack access rights.");
        setLoading(false);
        return;
      }
      
      const lessonsData = await fetchLessons(session.accessToken);
      
      // Check if lessons have course data, if not fetch courses separately
      const hasCourseData = lessonsData.length > 0 && lessonsData[0].course;
      
      if (!hasCourseData) {
        const { fetchCourses } = await import("../api/courses/course");
        const coursesData = await fetchCourses(session.accessToken);
        
        const lessonsWithCourses = lessonsData.map(lesson => {
          const course = coursesData.find(course => course.courseId === lesson.courseId);
          return {
            ...lesson,
            course: course || null
          };
        });
        
        setLessons(lessonsWithCourses);
      } else {
        // Backend already returns lessons with course data included
        const lessonsWithCourses = lessonsData.map(lesson => {
          return {
            ...lesson,
            course: lesson.course || null
          };
        });
        
        setLessons(lessonsWithCourses);
      }
    } catch {
      setError("Failed to load data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [session]);

  // Reload data when refresh param is present
  useEffect(() => {
    const refresh = searchParams.get('refresh');
    if (refresh) {
      console.log('Refresh param detected, reloading data...');
      loadData();
      // Clear the refresh param from URL
      router.replace('/lessons');
    }
  }, [searchParams]);

  const handleAdd = () => {
    router.push("/lessons/add");
  };

  const handleDelete = async (lessonId: string) => {
    if (!session?.accessToken) return;
    if (!window.confirm("Are you sure you want to delete this lesson?")) return;
    
    try {
      await deleteLesson(lessonId, session.accessToken);
      setLessons((prev) => prev.filter((l) => l.lessonId !== lessonId));
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Failed to delete lesson. Please try again.");
      }
    }
  };

  const handleViewContents = (lessonId: string) => {
    router.push(`/lessons/${lessonId}/contents`);
  };

  const toggleCourseExpansion = (courseKey: string) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseKey)) {
      newExpanded.delete(courseKey);
    } else {
      newExpanded.add(courseKey);
    }
    setExpandedCourses(newExpanded);
  };

  // Filter lessons based on search term
  const filteredLessons = lessons.filter((lesson) => {
    if (!searchTerm.trim()) return true; // Show all if no search term
    
    const searchLower = searchTerm.toLowerCase();
    const courseTitleMatch = lesson.course?.title?.toLowerCase().includes(searchLower) || false;
    
    return courseTitleMatch;
  });

  // Group lessons by course with better logic
  const lessonsByCourse = filteredLessons.reduce((acc, lesson) => {
    const courseId = lesson.courseId;
    const courseTitle = lesson.course?.title || `Course ${courseId}`;
    
    // Use both courseId and course title as key to ensure uniqueness
    const key = `${courseId}-${courseTitle}`;
    
    if (!acc[key]) {
      acc[key] = {
        courseId: courseId,
        courseTitle: courseTitle,
        course: lesson.course || null,
        lessons: []
      };
    }
    
    acc[key].lessons.push(lesson);
    return acc;
  }, {} as Record<string, { courseId: string; courseTitle: string; course: Course | null; lessons: LessonWithCourse[] }>);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div>Loading lessons...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Lessons</h2>
            <p className="text-muted-foreground">
              Manage your lesson catalog organized by course.
            </p>
          </div>
          <Button
            className="flex items-center gap-2"
            onClick={handleAdd}
          >
            <Plus className="h-5 w-5" />
            Create Lesson
          </Button>
        </div>

        {error ? (
          <div className="text-red-500 text-center py-8">{error}</div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by course name..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(lessonsByCourse).map(([key, courseData]) => {
                const { courseTitle, course, lessons: courseLessons } = courseData;
                const isExpanded = expandedCourses.has(key);
                
                return (
                  <Card key={key}>
                    <CardHeader 
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => toggleCourseExpansion(key)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          )}
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg">
                              {courseTitle}
                            </CardTitle>
                            {!course?.title && (
                              <span className="text-xs text-muted-foreground">(Course data not available)</span>
                            )}
                          </div>
                          <Badge variant="secondary">
                            {courseLessons.length} lesson{courseLessons.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    {isExpanded && (
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          {courseLessons
                            .sort((a, b) => a.order - b.order)
                            .map((lesson) => (
                              <div
                                key={lesson.lessonId}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                                    {lesson.order}
                                  </div>
                                  <div>
                                    <h3 className="font-medium">{lesson.lessonName}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                      <FileText className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-sm text-muted-foreground">
                                        {lesson.contents?.length || 0} content items
                                      </span>
                                      <span className="text-sm text-muted-foreground">•</span>
                                      <span className="text-sm text-muted-foreground">
                                        {new Date(lesson.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleViewContents(lesson.lessonId)}
                                  >
                                    Contents
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() => router.push(`/lessons/edit/${lesson.lessonId}`)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="destructive"
                                    onClick={() => handleDelete(lesson.lessonId)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
              
              {Object.keys(lessonsByCourse).length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  {searchTerm ? "No lessons found matching your search." : "No lessons found. Create your first lesson to get started."}
                </div>
              )}
            </div>
            
            {searchTerm && (
              <div className="text-sm text-muted-foreground">
                Showing {filteredLessons.length} of {lessons.length} lessons.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 