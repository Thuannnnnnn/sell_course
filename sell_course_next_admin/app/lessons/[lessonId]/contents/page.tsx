"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import {
  fetchContentsByLesson,
  deleteContent,
} from "../../../api/lessons/content";
import { fetchLessons } from "../../../api/lessons/lesson";
import { Content } from "../../../types/lesson";
import { Lesson } from "../../../types/lesson";
import { Card, CardContent } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import {
  Edit,
  Trash2,
  Plus,
  ArrowLeft,
  FileText,
  Video,
  Image,
  CircleFadingPlus,
} from "lucide-react";

export default function LessonContentsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const lessonId = params.lessonId as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        if (!session?.accessToken) {
          setError("You are not logged in or lack access rights.");
          setLoading(false);
          return;
        }

        const [lessonsData, contentsData] = await Promise.all([
          fetchLessons(session.accessToken),
          fetchContentsByLesson(lessonId, session.accessToken),
        ]);

        const foundLesson = lessonsData.find(
          (l: Lesson) => l.lessonId === lessonId
        );
        if (!foundLesson) {
          setError("Lesson not found.");
          setLoading(false);
          return;
        }

        setLesson(foundLesson);
        setContents(contentsData);
      } catch {
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (lessonId) {
      loadData();
    }
  }, [session, lessonId]);

  const handleAdd = () => {
    router.push(`/lessons/${lessonId}/contents/add`);
  };

  const handleDelete = async (contentId: string) => {
    if (!session?.accessToken) return;
    if (!window.confirm("Are you sure you want to delete this content?"))
      return;

    try {
      await deleteContent(contentId, session.accessToken);
      setContents((prev) => prev.filter((c) => c.contentId !== contentId));
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Failed to delete content. Please try again.");
      }
    }
  };

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType.toLowerCase()) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "image":
        return <Image className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getContentTypeColor = (contentType: string) => {
    switch (contentType.toLowerCase()) {
      case "video":
        return "bg-blue-100 text-blue-800";
      case "image":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!lesson) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">{error || "Loading..."}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/lessons")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Lesson Contents</h1>
          <p className="text-muted-foreground">{lesson.lessonName}</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {contents.length} content item{contents.length !== 1 ? "s" : ""}
          </Badge>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Content
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {contents
                .sort((a, b) => a.order - b.order)
                .map((content) => (
                  <div
                    key={content.contentId}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                        {content.order}
                      </div>
                      <div className="flex items-center gap-2">
                        {getContentTypeIcon(content.contentType)}
                        <div>
                          <h3 className="font-medium">{content.contentName}</h3>
                          <Badge
                            variant="outline"
                            className={getContentTypeColor(content.contentType)}
                          >
                            {content.contentType}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() =>
                          router.push(
                            `/lessons/${lessonId}/contents/${
                              content.contentId
                            }/${content.contentType.toLowerCase()}`
                          )
                        }
                      >
                        <CircleFadingPlus className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() =>
                          router.push(
                            `/lessons/${lessonId}/contents/edit/${content.contentId}`
                          )
                        }
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => handleDelete(content.contentId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

              {contents.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No content found for this lesson. Add your first content item
                  to get started.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
