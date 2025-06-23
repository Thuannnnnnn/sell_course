"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { createLesson } from "../../api/lessons/lesson";
import { fetchCourses } from "../../api/courses/course";
import { Course } from "../../types/course";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { ArrowLeft, RefreshCw } from "lucide-react";

export default function AddLessonPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formKey, setFormKey] = useState(0); // Key to force re-render
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  const [formData, setFormData] = useState({
    lessonName: "",
    courseId: "",
  });

  // Reset form when component mounts
  useEffect(() => {
    console.log("Component mounted, resetting form...");
    resetForm();
    setIsFormInitialized(true);
  }, []);

  // Reset form when refresh param changes
  useEffect(() => {
    const refresh = searchParams.get('refresh');
    if (refresh && isFormInitialized) {
      console.log("Refresh param detected, resetting form...");
      resetForm();
    }
  }, [searchParams, isFormInitialized]);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        if (!session?.accessToken) {
          setError("You are not logged in or lack access rights.");
          return;
        }
        const coursesData = await fetchCourses(session.accessToken);
        console.log("Fetched courses:", coursesData); // Debug log
        console.log("Number of courses:", coursesData.length); // Debug log
        setCourses(coursesData);
      } catch (error) {
        console.error("Error loading courses:", error); // Debug log
        setError("Failed to load courses. Please try again later.");
      }
    };

    loadCourses();
  }, [session]);

  const resetForm = useCallback(() => {
    console.log("Resetting form..."); // Debug log
    setFormData({
      lessonName: "",
      courseId: "",
    });
    setFormKey(prev => prev + 1); // Force re-render
    setError("");
  }, []);

  const handleInputChange = useCallback((field: string, value: string) => {
    console.log(`Setting ${field} to:`, value); // Debug log
    console.log("Current form data before update:", formData); // Debug log
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      console.log("New form data after update:", newData); // Debug log
      return newData;
    });
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.accessToken) return;

    console.log("=== SUBMIT FORM ===");
    console.log("Current formData state:", formData); // Debug log
    console.log("Form element values:");
    console.log("- courseId:", formData.courseId);
    console.log("- lessonName:", formData.lessonName);

    if (!formData.lessonName.trim() || !formData.courseId) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Sending to API:", formData); // Debug log
      const result = await createLesson(formData, session.accessToken);
      console.log("Lesson created successfully:", result); // Debug log
      
      // Navigate back to lessons page with refresh param
      router.push("/lessons?refresh=true");
    } catch (error) {
      console.error("Error creating lesson:", error); // Debug log
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to create lesson. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [formData, session, router]);

  const handleCancel = useCallback(() => {
    resetForm();
    router.push("/lessons");
  }, [resetForm, router]);

  const handleBack = useCallback(() => {
    resetForm();
    router.back();
  }, [resetForm, router]);

  const handleClearForm = useCallback(() => {
    resetForm();
    // Force refresh by adding timestamp to URL
    router.push(`/lessons/add?refresh=${Date.now()}`);
  }, [resetForm, router]);

  // Debug log for courses rendering
  useEffect(() => {
    console.log("Rendering courses dropdown with", courses.length, "courses");
    courses.forEach((course) => {
      console.log("Rendering course option:", course.courseId, course.title);
    });
  }, [courses]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Add New Lesson</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearForm}
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Clear Form
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lesson Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form key={formKey} onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="courseId">Course *</Label>
              <Select
                value={formData.courseId}
                onValueChange={(value) => handleInputChange("courseId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.courseId} value={course.courseId}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.courseId && (
                <p className="text-sm text-muted-foreground">
                  Selected: {courses.find(c => c.courseId === formData.courseId)?.title}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lessonName">Lesson Name *</Label>
              <Input
                id="lessonName"
                value={formData.lessonName}
                onChange={(e) => handleInputChange("lessonName", e.target.value)}
                placeholder="Enter lesson name"
                required
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Creating..." : "Create Lesson"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 