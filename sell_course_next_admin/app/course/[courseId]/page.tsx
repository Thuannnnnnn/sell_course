"use client";
import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { fetchLessons, deleteLesson, createLesson, updateLesson } from "../../api/lessons/lesson";
import { Lesson } from "../../types/lesson";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Edit, Trash2, Plus, BookOpen, FileText, ArrowLeft } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";

function AddLessonModal({
  courseId,
  onClose,
  onSuccess,
}: {
  courseId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { data: session } = useSession();
  const [lessonName, setLessonName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting lesson with data:", { lessonName, courseId });
    if (!lessonName.trim()) {
      setError("Please enter a lesson name.");
      return;
    }
    if (!session?.accessToken) {
      setError("You must be logged in.");
      return;
    }
    if (!courseId) {
      setError("Course ID is missing.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const lessonsCount = (await fetchLessons(session.accessToken)).filter(
        (lesson) => lesson.course != null && String(lesson.course.courseId) === String(courseId)
      ).length;
      const response = await createLesson(
        { lessonName, courseId, order: lessonsCount + 1 },
        session.accessToken
      );
      console.log("Lesson created:", response);
      setLessonName("");
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error creating lesson:", err);
      setError("Failed to create lesson.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">Add Lesson</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Lesson name"
            value={lessonName}
            onChange={(e) => setLessonName(e.target.value)}
            disabled={loading}
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditLessonModal({
  lesson,
  accessToken,
  onClose,
  onSuccess,
}: {
  lesson: Lesson;
  accessToken: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [lessonName, setLessonName] = useState(lesson.lessonName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonName.trim()) {
      setError("Please enter lesson name.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await updateLesson(lesson.lessonId, { lessonName }, accessToken);
      onSuccess();
      onClose();
    } catch {
      setError("Failed to update lesson.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">Edit Lesson</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Lesson name"
            value={lessonName}
            onChange={(e) => setLessonName(e.target.value)}
            disabled={loading}
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LessonListOfCourse({ courseId }: { courseId: string }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editLesson, setEditLesson] = useState<Lesson | null>(null);

  const loadData = useCallback(async () => {
    console.log("loadData called with courseId:", courseId);
    console.log("Session:", session);
    if (!session || !session.accessToken) {
      console.log("Session not ready, skipping loadData");
      setError("You are not logged in or lack access rights.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const lessonsData = await fetchLessons(session.accessToken);
      console.log("Fetched lessons:", lessonsData);
      const filtered = lessonsData.filter(
        (lesson) => lesson.course != null && String(lesson.course.courseId) === String(courseId)
      );
      console.log("Filtered lessons:", filtered);
      setLessons(filtered);
      if (filtered.length === 0) {
        console.log("No lessons found for courseId:", courseId);
      }
    } catch (err) {
      console.error("Error fetching lessons:", err);
      setError("Failed to load data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [session, courseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (status === "loading") {
    return <div className="text-center py-8">Loading session...</div>;
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  const handleDelete = async (lessonId: string) => {
    if (!session?.accessToken) {
      setError("You must be logged in.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this lesson?")) return;
    try {
      await deleteLesson(lessonId, session.accessToken);
      console.log("Lesson deleted:", lessonId);
      setLessons((prev) => {
        const filtered = prev.filter((l) => l.lessonId !== lessonId);
        const reordered = filtered.map((l, idx) => ({ ...l, order: idx + 1 }));
        reordered.forEach((l) => {
          updateLesson(l.lessonId, { order: l.order }, session.accessToken!);
        });
        return reordered;
      });
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete lesson. Please try again.");
    }
  };

  const handleViewContents = (lessonId: string) => {
    router.push(`/course/${courseId}/${lessonId}/contents`);
  };

  console.log("Rendering lessons:", lessons);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/course')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Lessons of this Course</h2>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setShowAddModal(true)}>
          <Plus className="h-5 w-5" />
          Add Lesson
        </Button>
      </div>
      <div className="mb-4">
        <Input
          placeholder="Search lesson name..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="space-y-4">
        {loading && <div className="text-center py-8">Loading lessons...</div>}
        {error && <div className="text-red-500 text-center py-8">{error}</div>}
        {!loading && lessons.length === 0 && !error && (
          <div className="text-center text-muted-foreground py-8">
            No lessons found for this course.
          </div>
        )}
        {lessons
          .filter((lesson) => lesson.lessonName.toLowerCase().includes(searchTerm.toLowerCase()))
          .map((lesson) => (
            <Card key={lesson.lessonId}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{lesson.lessonName}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-muted-foreground">
                      Order: {lesson.order} • Created:{" "}
                      {new Date(lesson.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewContents(lesson.lessonId)}
                      className="flex items-center gap-1"
                    >
                      <FileText className="h-3 w-3" />
                      Contents
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditLesson(lesson)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(lesson.lessonId)}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
      {showAddModal && (
        <AddLessonModal
          courseId={courseId}
          onClose={() => setShowAddModal(false)}
          onSuccess={loadData}
        />
      )}
      {editLesson && session && session.accessToken && (
        <EditLessonModal
          lesson={editLesson}
          accessToken={session.accessToken}
          onClose={() => setEditLesson(null)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}

export default function CourseLessonPage({ params }: { params: { courseId: string } }) {
  const { courseId } = params;
  console.log("CourseLessonPage courseId:", courseId);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LessonListOfCourse courseId={courseId} />
    </Suspense>
  );
}