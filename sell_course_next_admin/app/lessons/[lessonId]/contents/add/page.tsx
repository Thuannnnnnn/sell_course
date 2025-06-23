"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { createContent } from "../../../../api/lessons/content";
import { fetchLessons } from "../../../../api/lessons/lesson";
import { Lesson } from "../../../../types/lesson";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { Label } from "../../../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../components/ui/select";
import { ArrowLeft } from "lucide-react";

export default function AddContentPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const lessonId = params.lessonId as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    contentName: "",
    contentType: "",
  });

  useEffect(() => {
    const loadLesson = async () => {
      try {
        if (!session?.accessToken) {
          setError("You are not logged in or lack access rights.");
          return;
        }

        const lessons = await fetchLessons(session.accessToken);
        const foundLesson = lessons.find(
          (l: Lesson) => l.lessonId === lessonId
        );

        if (!foundLesson) {
          setError("Lesson not found.");
          return;
        }

        setLesson(foundLesson);
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

    if (!formData.contentName.trim() || !formData.contentType) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createContent(
        {
          lessonId,
          contentName: formData.contentName,
          contentType: formData.contentType,
        },
        session.accessToken
      );
      router.push(`/lessons/${lessonId}/contents`);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to create content. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!lesson) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center py-8">{error || "Loading..."}</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Add New Content</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Lesson</Label>
              <Input value={lesson.lessonName} disabled className="bg-muted" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contentType">Content Type *</Label>
              <Select
                value={formData.contentType}
                onValueChange={(value) =>
                  handleInputChange("contentType", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="doc">Doc</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contentName">Content Name *</Label>
              <Input
                id="contentName"
                value={formData.contentName}
                onChange={(e) =>
                  handleInputChange("contentName", e.target.value)
                }
                placeholder="Enter content name"
                required
              />
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Creating..." : "Create Content"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/lessons/${lessonId}/contents`)}
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
