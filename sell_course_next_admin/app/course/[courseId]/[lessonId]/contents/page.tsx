"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import {
  fetchContentsByLesson,
  deleteContent,
  createContent,
} from "../../../../api/lessons/content";
import { fetchLessons } from "../../../../api/lessons/lesson";
import { quizApi } from "../../../../api/quiz/quiz";
import { Content } from "../../../../types/lesson";
import { Lesson } from "../../../../types/lesson";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../../components/ui/card";
import { Button } from "../../../../../components/ui/button";
import { Badge } from "../../../../../components/ui/badge";
import {
  Edit,
  Trash2,
  Plus,
  ArrowLeft,
  FileText,
  Video,
  CircleFadingPlus,
  HelpCircle,
} from "lucide-react";
import { Input } from "../../../../../components/ui/input";
import { Label } from "../../../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../components/ui/select";
import DocumentModal from "../../../../../components/course/content/DocumentModalContent";

interface AddContentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lessonId: string;
}

function AddContentModal({
  open,
  onClose,
  onSuccess,
  lessonId,
}: AddContentModalProps) {
  const { data: session } = useSession();
  const [contentName, setContentName] = useState("");
  const [contentType, setContentType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log('🔄 AddContentModal state changed:', { open });
    if (!open) {
      console.log('🧹 Clearing modal form data');
      setContentName("");
      setContentType("");
      setError("");
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('📝 Creating content:', { lessonId, contentName, contentType });
    
    if (!session?.accessToken) {
      console.log('❌ No access token');
      return;
    }
    if (!contentName.trim()) {
      setError("Content name is required.");
      return;
    }
    if (!contentType) {
      setError("Content type is required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await createContent(
        {
          lessonId,
          contentName,
          contentType,
        },
        session.accessToken
      );
      console.log('✅ Content created successfully:', result);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.log('❌ Error creating content:', err);
      if (err && typeof err === "object" && "message" in err) {
        setError(
          (err as { message?: string }).message || "Failed to add content."
        );
      } else {
        setError("Failed to add content.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Add Content</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="contentName">Content Name</Label>
                <Input
                  id="contentName"
                  value={contentName}
                  onChange={(e) => setContentName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="contentType">Content Type</Label>
                <Select
                  value={contentType}
                  onValueChange={setContentType}
                  required
                >
                  <SelectTrigger id="contentType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="doc">Document</SelectItem>
                    <SelectItem value="quizz">Quizz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  style={{
                    backgroundColor: "#513deb",
                    color: "white",
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = "#4f46e5";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = "#513deb";
                    }
                  }}
                >
                  Add
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LessonContentsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const lessonId = params.lessonId as string;
  const courseId = params.courseId as string;

  console.log('🎯 LessonContentsPage loaded:', { courseId, lessonId });

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(
    null
  );

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
        console.log('📚 Loaded data:', { 
          lessonsCount: lessonsData.length, 
          contentsCount: contentsData.length,
          contents: contentsData 
        });
        
        const foundLesson = lessonsData.find(
          (l: Lesson) => l.lessonId === lessonId
        );
        if (!foundLesson) {
          console.log('❌ Lesson not found:', lessonId);
          setError("Lesson not found.");
          setLoading(false);
          return;
        }
        console.log('✅ Lesson found:', foundLesson);
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
    console.log('➕ Opening add content modal');
    setShowAddModal(true);
  };

  const handleDelete = async (contentId: string) => {
    if (!session?.accessToken) return;
    if (!window.confirm("Are you sure you want to delete this content?"))
      return;

    try {
      await deleteContent(contentId, session.accessToken);
      setContents((prev) => {
        const filtered = prev.filter((c) => c.contentId !== contentId);
        const reordered = filtered.map((c, idx) => ({ ...c, order: idx + 1 }));
        return reordered;
      });
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Failed to delete content. Please try again.");
      }
    }
  };
  const refreshContents = async () => {
    if (!session?.accessToken) return;
    console.log('🔄 Refreshing contents for lesson:', lessonId);
    try {
      const contentsData = await fetchContentsByLesson(
        lessonId,
        session.accessToken
      );
      console.log('✅ Contents refreshed:', contentsData);
      setContents(contentsData);
    } catch (error) {
      console.log('❌ Failed to refresh contents:', error);
      setError("Failed to reload contents.");
    }
  };

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType.toLowerCase()) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "image":
        return <Image className="h-4 w-4" />;
      case "quizz":
        return <HelpCircle className="h-4 w-4" />;
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
      case "quizz":
        return "bg-purple-100 text-purple-800";
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

  const openDocumentModal = (contentType: string, contentId: string) => {
    if (contentType === "doc") {
      setSelectedContentId(contentId);
      setShowDocumentModal(true);
    }
  };

  const closeDocumentModal = () => {
    setShowDocumentModal(false);
    setSelectedContentId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push(`/course/${courseId}`)}
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
        <Button
          onClick={handleAdd}
          style={{
            backgroundColor: "#513deb",
            color: "white",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#4f46e5";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#513deb";
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Content
        </Button>
      </div>

      <AddContentModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={refreshContents}
        lessonId={lessonId}
      />

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
                .map((content) => {
                  console.log('🎨 Rendering content:', {
                    contentId: content.contentId,
                    contentName: content.contentName,
                    contentType: content.contentType,
                    isQuizz: content.contentType.toLowerCase() === 'quizz'
                  });
                  return (
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
                      {content.contentType.toLowerCase() === 'quizz' && (
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={async () => {


                            try {
                              // Check if quiz already exists for this content
                              const quizzes = await quizApi.getQuizzesByContentId(courseId, lessonId, content.contentId);
                              
                              let quizUrl;
                              if (quizzes && quizzes.length > 0) {
                                // Quiz exists, navigate with quizId
                                const existingQuiz = quizzes[0]; // Take first quiz
                                quizUrl = `/course/${courseId}/${lessonId}/contents/quiz?contentId=${content.contentId}&quizId=${existingQuiz.quizzId}`;

                              } else {
                                // No quiz exists, navigate without quizId
                                quizUrl = `/course/${courseId}/${lessonId}/contents/quiz?contentId=${content.contentId}`;

                              }
                              
                              router.push(quizUrl);
                            } catch {

                              // Fallback to navigate without quizId
                              const fallbackUrl = `/course/${courseId}/${lessonId}/contents/quiz?contentId=${content.contentId}`;

                              router.push(fallbackUrl);
                            }
                          }}
                          title="Manage Quiz"
                        >
                          <CircleFadingPlus className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() =>
                          router.push(
                            `/course/${courseId}/${lessonId}/contents/edit/${content.contentId}`
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
                  );
                })}

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
      {showDocumentModal && selectedContentId && (
        <DocumentModal
          isOpen={showDocumentModal}
          onClose={closeDocumentModal}
          params={{ lessonId, contentId: selectedContentId }}
        />
      )}
    </div>
  );
}
