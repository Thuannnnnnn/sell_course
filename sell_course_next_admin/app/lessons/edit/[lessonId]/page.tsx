"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { updateLesson } from "../../../api/lessons/lesson";
import { fetchLessons } from "../../../api/lessons/lesson";
import { Lesson } from "../../../types/lesson";
import { Card, CardHeader, CardTitle, CardContent } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { ArrowLeft } from "lucide-react";

export default function EditLessonPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const lessonId = params.lessonId as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    lessonName: "",
  });

  useEffect(() => {
    const loadLesson = async () => {
      try {
        if (!session?.accessToken) {
          setError("You are not logged in or lack access rights.");
          return;
        }

        const lessons = await fetchLessons(session.accessToken);
        const foundLesson = lessons.find(l => l.lessonId === lessonId);

        if (!foundLesson) {
          setError("Lesson not found.");
          return;
        }

        if (!foundLesson.course) {
          console.log('No course data in lesson, fetching courses separately...');
          const { fetchCourses } = await import("../../../api/courses/course");
          const coursesData = await fetchCourses(session.accessToken);

          const course = coursesData.find(course => course.courseId === foundLesson.courseId);
          const lessonWithCourse = {
            ...foundLesson,
            course: course || null
          };

          setLesson(lessonWithCourse);
        } else {
          setLesson(foundLesson);
        }
        setFormData({
          lessonName: foundLesson.lessonName,
        });
      } catch {
        setError("Failed to load lesson. Please try again later.");
      }
    };

    if (lessonId) {
      loadLesson();
    }
  }, [session, lessonId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.accessToken) return;

    if (!formData.lessonName.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await updateLesson(lessonId, formData, session.accessToken);
      router.push("/lessons");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to update lesson. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!lesson) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center py-8">
          {error || "Loading..."}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Edit Lesson</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lesson Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="space-y-2">
              <Label>Course</Label>
              <Input
                value={lesson.course?.title || lesson.courseId}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label>Order</Label>
              <Input
                value={lesson.order}
                disabled
                className="bg-muted"
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
                {loading ? "Updating..." : "Update Lesson"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/lessons")}
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